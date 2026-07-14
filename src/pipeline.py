"""Orchestrates the full RAG workflow so entry-point scripts stay thin.

Public functions:
- ingest()                 : build the FAISS index from every PDF in data/
- answer_question()        : retrieve chunks, return (chunks, full_answer)
- answer_question_stream() : retrieve chunks, return (chunks, answer_stream)
                              where answer_stream is a generator of text
                              pieces as they're produced by the LLM

Both answer_* functions accept an optional `history` (list of recent
(question, answer) tuples) which is passed straight through to the
generator so the model gets short-term conversational context.

Retrieval is routed to hybrid (FAISS + BM25) or plain semantic search
based on the HYBRID_SEARCH config flag, then optionally reranked with
a CrossEncoder based on the RERANK config flag — see _retrieve_chunks().

Each major stage is timed with src.metrics.timer and logged at INFO
level. Timing is purely observational: it records how long a stage
took but never changes what the stage does or returns.
"""

import logging
from src.loader import load_all_pdfs
from src.chunker import chunk_documents
from src.embedder import embed_texts
from src.vectorstore import build_index, save, load
from src.retriever import retrieve
from src.hybrid_retriever import hybrid_retrieve
from src.reranker import rerank
from src.generator import generate_answer, generate_answer_stream
from src.metrics import timer, format_duration
from src.config import TOP_K, HYBRID_SEARCH, RERANK, RERANK_CANDIDATE_POOL

logger = logging.getLogger(__name__)


def ingest():
    """PDFs in data/ -> chunks -> embeddings -> FAISS index on disk."""
    with timer("loading") as t:
        documents = load_all_pdfs()
    logger.info("Stage 'loading' completed in %s", format_duration(t.elapsed))

    with timer("chunking") as t:
        chunks = chunk_documents(documents)
    logger.info("Stage 'chunking' completed in %s", format_duration(t.elapsed))

    texts = [c["text"] for c in chunks]
    with timer("embedding") as t:
        vectors = embed_texts(texts)
    logger.info("Stage 'embedding' completed in %s", format_duration(t.elapsed))

    with timer("vector_store") as t:
        index = build_index(vectors)
        save(index, chunks)
    logger.info("Stage 'vector store creation' completed in %s", format_duration(t.elapsed))

    logger.info(
        "Ingestion complete: %d document(s), %d chunks indexed.",
        len(documents), len(chunks),
    )
    return chunks


def _retrieve_chunks(question, index, chunks, top_k):
    """Route to hybrid (FAISS + BM25) or plain semantic retrieval, then
    optionally rerank the results down to top_k with a CrossEncoder.

    When RERANK is False, the retrieval pool size equals top_k, so no
    extra candidates are ever fetched and no reranking call is made —
    behavior is identical to before this feature existed.
    """
    pool_size = RERANK_CANDIDATE_POOL if RERANK else top_k

    with timer("retrieval") as t:
        if HYBRID_SEARCH:
            candidates = hybrid_retrieve(question, index, chunks, top_k=pool_size)
        else:
            candidates = retrieve(question, index, chunks, top_k=pool_size)
    logger.info("Stage 'retrieval' completed in %s", format_duration(t.elapsed))

    if RERANK:
        with timer("reranking") as t:
            candidates = rerank(question, candidates, top_k=top_k)
        logger.info("Stage 'reranking' completed in %s", format_duration(t.elapsed))

    return candidates


def answer_question(question, top_k=TOP_K, history=None):
    """Load the index, retrieve relevant chunks, and generate an answer.

    Returns (retrieved_chunks, answer_text).
    """
    with timer("loading") as t:
        index, chunks = load()
    logger.info("Stage 'loading' completed in %s", format_duration(t.elapsed))

    retrieved = _retrieve_chunks(question, index, chunks, top_k)

    with timer("generation") as t:
        answer = generate_answer(question, retrieved, history=history)
    logger.info("Stage 'generation' completed in %s", format_duration(t.elapsed))

    return retrieved, answer


def answer_question_stream(question, top_k=TOP_K, history=None):
    """Same as answer_question(), but the answer is streamed.

    Returns (retrieved_chunks, answer_stream) where answer_stream is a
    generator yielding the answer text as it's produced. Generation
    time for the streaming path is measured by the caller (query.py),
    since it happens as the stream is consumed, not inside this call.
    """
    with timer("loading") as t:
        index, chunks = load()
    logger.info("Stage 'loading' completed in %s", format_duration(t.elapsed))

    retrieved = _retrieve_chunks(question, index, chunks, top_k)
    answer_stream = generate_answer_stream(question, retrieved, history=history)
    return retrieved, answer_stream
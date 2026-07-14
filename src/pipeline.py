"""Orchestrates the full RAG workflow so entry-point scripts stay thin.

Two public functions:
- ingest()          : build the FAISS index from every PDF in data/
- answer_question() : retrieve relevant chunks and generate an answer
"""

import logging
from src.loader import load_all_pdfs
from src.chunker import chunk_documents
from src.embedder import embed_texts
from src.vectorstore import build_index, save, load
from src.retriever import retrieve
from src.generator import generate_answer
from src.config import TOP_K

logger = logging.getLogger(__name__)


def ingest():
    """PDFs in data/ -> chunks -> embeddings -> FAISS index on disk."""
    documents = load_all_pdfs()
    chunks = chunk_documents(documents)

    texts = [c["text"] for c in chunks]
    vectors = embed_texts(texts)

    index = build_index(vectors)
    save(index, chunks)

    logger.info(
        "Ingestion complete: %d document(s), %d chunks indexed.",
        len(documents), len(chunks),
    )
    return chunks


def answer_question(question, top_k=TOP_K):
    """Load the index, retrieve relevant chunks, and generate an answer.

    Returns (retrieved_chunks, answer_text) so callers (e.g. the CLI)
    can display retrieval details before printing the final answer.
    """
    index, chunks = load()
    retrieved = retrieve(question, index, chunks, top_k=top_k)
    answer = generate_answer(question, retrieved)
    return retrieved, answer
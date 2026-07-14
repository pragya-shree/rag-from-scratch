"""Optional reranking stage.

Runs strictly AFTER retrieval (semantic or hybrid) has already produced
a candidate pool of chunks — this module never talks to FAISS or BM25,
it only re-scores chunks it's handed and picks the best ones.

Uses a CrossEncoder, which scores a (question, chunk_text) pair directly
(unlike the bi-encoder used for embeddings), which tends to be more
accurate at judging relevance but too slow to run over an entire corpus
— hence it only runs over the small candidate pool retrieval already
narrowed things down to.
"""

import logging
from sentence_transformers import CrossEncoder
from src.config import RERANK_MODEL

logger = logging.getLogger(__name__)

_model = None  # loaded once and reused across calls


def get_model():
    global _model
    if _model is None:
        logger.info("Loading reranker model: %s", RERANK_MODEL)
        _model = CrossEncoder(RERANK_MODEL)
    return _model


def rerank(question, chunks, top_k):
    """Score each chunk against the question and return the top_k
    highest-scoring chunks, best first.

    Each returned chunk's "score" field is overwritten with the
    CrossEncoder relevance score (higher = better) — same field name
    used by every other retrieval stage, just a different scale.
    """
    if not chunks:
        return chunks

    model = get_model()
    pairs = [(question, c["text"]) for c in chunks]
    scores = model.predict(pairs)

    reranked = sorted(
        ({**c, "score": float(s)} for c, s in zip(chunks, scores)),
        key=lambda c: c["score"],
        reverse=True,
    )

    logger.info(
        "Reranked %d candidates -> top %d chunks", len(chunks), min(top_k, len(chunks))
    )
    return reranked[:top_k]
"""Keyword-based retrieval using BM25.

The BM25 index is built on demand from the chunks already loaded by the
vector store — there's no separate storage format or database. This is
intentionally simple: rebuilding BM25 from an in-memory list is cheap
for the corpus sizes this project targets.
"""

import logging
from rank_bm25 import BM25Okapi
from src.config import KEYWORD_TOP_K

logger = logging.getLogger(__name__)


def _tokenize(text):
    return text.lower().split()


def build_bm25_index(chunks):
    """Build an in-memory BM25 index from a list of chunk dicts
    ({id, filename, page, text}) — the same dicts used everywhere else.
    """
    tokenized_corpus = [_tokenize(c["text"]) for c in chunks]
    return BM25Okapi(tokenized_corpus)


def keyword_retrieve(question, chunks, top_k=KEYWORD_TOP_K, bm25_index=None):
    """Return the top_k chunks ranked by BM25 score (higher = more relevant).

    Pass a pre-built `bm25_index` to avoid rebuilding it; otherwise one
    is built from `chunks` for this call.
    """
    index = bm25_index or build_bm25_index(chunks)
    scores = index.get_scores(_tokenize(question))

    ranked_positions = sorted(
        range(len(chunks)), key=lambda i: scores[i], reverse=True
    )[:top_k]
    results = [{**chunks[i], "score": float(scores[i])} for i in ranked_positions]

    logger.info("BM25 retrieved %d chunks for question: %r", len(results), question)
    return results
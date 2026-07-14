"""Combines multiple retrieval methods into one ranked result list.

Currently combines FAISS semantic search and BM25 keyword search using
Reciprocal Rank Fusion (RRF). To add another retrieval method later:
write a function that returns a ranked list of chunk dicts (each with
an "id"), then add it to the `result_lists` passed into
_reciprocal_rank_fusion() in hybrid_retrieve().
"""

import logging
from src.retriever import retrieve as semantic_retrieve
from src.keyword_retriever import keyword_retrieve
from src.config import TOP_K, SEMANTIC_TOP_K, KEYWORD_TOP_K, RRF_K

logger = logging.getLogger(__name__)


def _reciprocal_rank_fusion(result_lists, k=RRF_K):
    """Merge several ranked, best-first result lists into one.

    Each chunk's fused score is the sum of 1/(k + rank + 1) across every
    list it appears in. Using rank (not raw score) sidesteps the need to
    normalize incompatible scales — FAISS distance (lower = better) and
    BM25 score (higher = better) are never compared directly.
    """
    fused_scores = {}
    chunk_lookup = {}

    for results in result_lists:
        for rank, chunk in enumerate(results):
            chunk_id = chunk["id"]
            chunk_lookup[chunk_id] = chunk  # de-dup: last write wins, content is identical
            fused_scores[chunk_id] = fused_scores.get(chunk_id, 0.0) + 1.0 / (k + rank + 1)

    ranked_ids = sorted(fused_scores, key=lambda cid: fused_scores[cid], reverse=True)
    return [{**chunk_lookup[cid], "score": fused_scores[cid]} for cid in ranked_ids]


def hybrid_retrieve(question, index, chunks, top_k=TOP_K,
                     semantic_top_k=SEMANTIC_TOP_K, keyword_top_k=KEYWORD_TOP_K):
    """Retrieve via FAISS + BM25, merge, de-duplicate, and return top_k."""
    semantic_results = semantic_retrieve(question, index, chunks, top_k=semantic_top_k)
    keyword_results = keyword_retrieve(question, chunks, top_k=keyword_top_k)

    merged = _reciprocal_rank_fusion([semantic_results, keyword_results])[:top_k]

    logger.info(
        "Hybrid retrieval: %d semantic + %d keyword -> %d merged, unique chunks",
        len(semantic_results), len(keyword_results), len(merged),
    )
    return merged
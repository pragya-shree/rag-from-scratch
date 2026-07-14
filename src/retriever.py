"""Step 5 of the pipeline: find the chunks most relevant to a question,
regardless of which source PDF they came from.

The FAISS index is not partitioned by document, so retrieval naturally
searches across every ingested PDF at once.
"""

import logging
from src.embedder import embed_texts
from src.config import TOP_K

logger = logging.getLogger(__name__)


def retrieve(question, index, chunks, top_k=TOP_K):
    """Return top_k chunks with their L2 distance score (lower = closer)."""
    query_vector = embed_texts([question])
    distances, indices = index.search(query_vector, top_k)

    results = []
    for rank, idx in enumerate(indices[0]):
        chunk = chunks[idx]
        score = float(distances[0][rank])
        results.append({**chunk, "score": score})

    sources = sorted({r["filename"] for r in results})
    logger.info(
        "Retrieved %d chunks from %d source file(s) %s for question: %r",
        len(results), len(sources), sources, question,
    )
    return results
"""Step 5 of the pipeline: find the chunks most relevant to a question."""

import logging
from src.embeddings import embed_texts
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

    logger.info("Retrieved %d chunks for question: %r", len(results), question)
    return results

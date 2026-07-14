# """Step 4 of the pipeline: store and load embeddings with FAISS.

# FAISS only stores vectors. The matching chunk text/metadata is kept
# separately in a JSON file, linked by array position (chunk "id").
# """

# import json
# import logging
# import faiss
# from src.config import INDEX_PATH, CHUNKS_PATH

# logger = logging.getLogger(__name__)


# def build_index(vectors):
#     """Create a flat L2 FAISS index from an (n, dim) float32 array."""
#     index = faiss.IndexFlatL2(vectors.shape[1])
#     index.add(vectors)
#     return index


# def save(index, chunks):
#     faiss.write_index(index, INDEX_PATH)
#     with open(CHUNKS_PATH, "w") as f:
#         json.dump(chunks, f)
#     logger.info("Saved index to %s and chunks to %s", INDEX_PATH, CHUNKS_PATH)


# def load():
#     index = faiss.read_index(INDEX_PATH)
#     with open(CHUNKS_PATH) as f:
#         chunks = json.load(f)
#     logger.info("Loaded index (%d vectors) and %d chunks", index.ntotal, len(chunks))
#     return index, chunks

"""Step 4 of the pipeline: store and load embeddings with FAISS.

All chunks from all documents live in ONE FAISS index. FAISS only
stores vectors; the matching chunk text/metadata (filename, page, id)
is kept separately in a JSON file, linked by array position.
"""

import json
import logging
import faiss
from src.config import INDEX_PATH, CHUNKS_PATH

logger = logging.getLogger(__name__)


def build_index(vectors):
    """Create a flat L2 FAISS index from an (n, dim) float32 array."""
    index = faiss.IndexFlatL2(vectors.shape[1])
    index.add(vectors)
    logger.info("Built FAISS index with %d vectors", index.ntotal)
    return index


def save(index, chunks):
    faiss.write_index(index, INDEX_PATH)
    with open(CHUNKS_PATH, "w") as f:
        json.dump(chunks, f)
    logger.info("Saved index to %s and chunks to %s", INDEX_PATH, CHUNKS_PATH)


def load():
    index = faiss.read_index(INDEX_PATH)
    with open(CHUNKS_PATH) as f:
        chunks = json.load(f)
    logger.info(
        "Loaded index (%d vectors) and %d chunk records", index.ntotal, len(chunks)
    )
    return index, chunks
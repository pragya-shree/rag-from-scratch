# """Step 3 of the pipeline: turn text into vectors."""

# import logging
# import numpy as np
# from sentence_transformers import SentenceTransformer
# from src.config import EMBEDDING_MODEL

# logger = logging.getLogger(__name__)

# _model = None  # loaded once and reused


# def get_model():
#     global _model
#     if _model is None:
#         logger.info("Loading embedding model: %s", EMBEDDING_MODEL)
#         _model = SentenceTransformer(EMBEDDING_MODEL)
#     return _model


# def embed_texts(texts):
#     """Encode a list of strings into a float32 numpy array."""
#     model = get_model()
#     vectors = model.encode(texts, show_progress_bar=True)
#     return np.array(vectors).astype("float32")

"""Step 3 of the pipeline: turn text into vectors."""

import logging
import numpy as np
from sentence_transformers import SentenceTransformer
from src.config import EMBEDDING_MODEL

logger = logging.getLogger(__name__)

_model = None  # loaded once and reused across calls


def get_model():
    global _model
    if _model is None:
        logger.info("Loading embedding model: %s", EMBEDDING_MODEL)
        _model = SentenceTransformer(EMBEDDING_MODEL)
    return _model


def embed_texts(texts):
    """Encode a list of strings into a float32 numpy array."""
    model = get_model()
    vectors = model.encode(texts, show_progress_bar=True)
    return np.array(vectors).astype("float32")
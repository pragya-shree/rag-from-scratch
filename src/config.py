# """All tunable settings live here so nothing is scattered across files."""

# # --- Paths ---
# PDF_PATH = "data/document.pdf"
# INDEX_PATH = "storage/index.faiss"
# CHUNKS_PATH = "storage/chunks.json"

# # --- Chunking ---
# CHUNK_SIZE = 800       # max characters per chunk
# CHUNK_OVERLAP = 100    # characters of overlap when a paragraph must be split

# # --- Embeddings ---
# EMBEDDING_MODEL = "all-MiniLM-L6-v2"

# # --- Retrieval ---
# TOP_K = 3

# # --- Gemini ---
# GEMINI_MODEL = "gemini-2.0-flash"

# # --- Logging ---
# LOG_LEVEL = "INFO"
# LOG_FORMAT = "%(asctime)s [%(levelname)s] %(name)s: %(message)s"
"""All tunable settings live here so nothing is scattered across files."""

# --- Paths ---
DATA_DIR = "data"                      # directory scanned for PDF files
INDEX_PATH = "storage/index.faiss"
CHUNKS_PATH = "storage/chunks.json"

# --- Chunking ---
CHUNK_SIZE = 800       # max characters per chunk
CHUNK_OVERLAP = 100    # characters of overlap when a paragraph must be split

# --- Embeddings ---
EMBEDDING_MODEL = "all-MiniLM-L6-v2"

# --- Retrieval ---
TOP_K = 3

# --- Gemini ---
GEMINI_MODEL = "gemini-2.0-flash"

# --- Logging ---
LOG_LEVEL = "INFO"
LOG_FORMAT = "%(asctime)s [%(levelname)s] %(name)s: %(message)s"
"""All tunable settings live here so nothing is scattered across files."""

# --- Paths ---
DATA_DIR = "data"                      # directory scanned for PDF files
INDEX_PATH = "storage/index.faiss"
CHUNKS_PATH = "storage/chunks.json"

# --- Chunking ---
CHUNK_SIZE = 500       # max characters per chunk
CHUNK_OVERLAP = 80    # characters of overlap when a paragraph must be split

# --- Embeddings ---
EMBEDDING_MODEL = "all-MiniLM-L6-v2"

# --- Retrieval ---
TOP_K = 5

# # --- Generation ---
# ENABLE_GENERATION = True

# --- Hybrid retrieval (FAISS semantic + BM25 keyword) ---
HYBRID_SEARCH = False   # False = semantic-only search (original behavior)
SEMANTIC_TOP_K = 5      # candidates pulled from FAISS before merging
KEYWORD_TOP_K = 5       # candidates pulled from BM25 before merging
RRF_K = 60              # Reciprocal Rank Fusion damping constant

# --- Reranking (optional) ---
RERANK = False                # False = behave exactly as before (no reranking)
RERANK_MODEL = "cross-encoder/ms-marco-MiniLM-L-6-v2"
RERANK_CANDIDATE_POOL = 15    # chunks pulled from retrieval before reranking down to top_k


# --- Ollama ---
OLLAMA_HOST = "http://localhost:11434"
OLLAMA_MODEL = "llama3.2:3b"
STREAMING = True   # True = stream tokens to the terminal as they're generated

# --- Conversation memory ---
MAX_HISTORY = 5   # number of recent (question, answer) exchanges kept in prompts

# --- Metrics ---
SHOW_METRICS = True   # print a performance summary after each query

# --- Logging ---
LOG_LEVEL = "INFO"
LOG_FORMAT = "%(asctime)s [%(levelname)s] %(name)s: %(message)s"
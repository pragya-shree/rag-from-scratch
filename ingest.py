"""Entry point: scan data/ for PDFs -> chunk -> embed -> build FAISS index.

Run this once (or whenever files in data/ change):
    python ingest.py
"""

import logging
from src.logging_setup import setup_logging
from src.pipeline import ingest

setup_logging()
logger = logging.getLogger(__name__)


def main():
    chunks = ingest()
    filenames = sorted({c["filename"] for c in chunks})
    logger.info("Indexed %d file(s): %s", len(filenames), filenames)


if __name__ == "__main__":
    main()
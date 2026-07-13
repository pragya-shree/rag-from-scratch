"""Entry point: PDF -> chunks -> embeddings -> FAISS index.

Run this once (or whenever the PDF changes):
    python ingest.py
"""

import logging
from src.logging_setup import setup_logging
from src.config import PDF_PATH
from src.pdf_loader import load_pages
from src.chunker import chunk_pages
from src.embeddings import embed_texts
from src.vector_store import build_index, save

setup_logging()
logger = logging.getLogger(__name__)


def main():
    pages = load_pages(PDF_PATH)
    chunks = chunk_pages(pages)

    texts = [c["text"] for c in chunks]
    vectors = embed_texts(texts)

    index = build_index(vectors)
    save(index, chunks)

    logger.info("Ingestion complete. %d chunks indexed.", len(chunks))


if __name__ == "__main__":
    main()

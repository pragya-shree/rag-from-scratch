"""Step 1 of the pipeline: discover every PDF in DATA_DIR and extract
per-page text using PyMuPDF (fitz).
"""

import os
import logging
import fitz  # PyMuPDF
from src.config import DATA_DIR

logger = logging.getLogger(__name__)


def find_pdf_files(data_dir=DATA_DIR):
    """Return a sorted list of full paths to every .pdf file in data_dir."""
    if not os.path.isdir(data_dir):
        raise FileNotFoundError(f"Data directory not found: {data_dir}")

    files = sorted(
        os.path.join(data_dir, name)
        for name in os.listdir(data_dir)
        if name.lower().endswith(".pdf")
    )

    if not files:
        raise FileNotFoundError(f"No PDF files found in {data_dir}")

    logger.info("Found %d PDF file(s) in %s", len(files), data_dir)
    return files


def load_pdf(pdf_path):
    """Return [(page_number, text), ...] for a single PDF, 1-indexed."""
    doc = fitz.open(pdf_path)
    pages = [(i + 1, page.get_text()) for i, page in enumerate(doc)]
    doc.close()
    return pages


def load_all_pdfs(data_dir=DATA_DIR):
    """Return a list of documents: [{filename, pages}, ...]

    Each document's `pages` is [(page_number, text), ...], scoped only
    to that file so page numbers never mix across PDFs.
    """
    documents = []
    for pdf_path in find_pdf_files(data_dir):
        filename = os.path.basename(pdf_path)
        pages = load_pdf(pdf_path)
        logger.info("Loaded %s (%d pages)", filename, len(pages))
        documents.append({"filename": filename, "pages": pages})

    return documents
"""Step 1 of the pipeline: read a PDF and return text per page."""

import logging
from pypdf import PdfReader

logger = logging.getLogger(__name__)


def load_pages(pdf_path):
    """Return a list of (page_number, text) tuples, 1-indexed."""
    reader = PdfReader(pdf_path)
    pages = []
    for i, page in enumerate(reader.pages, start=1):
        text = page.extract_text() or ""
        pages.append((i, text))
    logger.info("Loaded %d pages from %s", len(pages), pdf_path)
    return pages

"""Step 2 of the pipeline: split page text into paragraph-aware chunks.

Paragraphs are kept whole and packed together up to CHUNK_SIZE.
A paragraph larger than CHUNK_SIZE is split with overlap so no chunk
exceeds the limit.
"""

import logging
from src.config import CHUNK_SIZE, CHUNK_OVERLAP

logger = logging.getLogger(__name__)


def _split_large_paragraph(text, size, overlap):
    parts = []
    start = 0
    while start < len(text):
        end = start + size
        parts.append(text[start:end])
        start += size - overlap
    return parts


def chunk_pages(pages, chunk_size=CHUNK_SIZE, overlap=CHUNK_OVERLAP):
    """Turn [(page_num, text), ...] into a list of chunk dicts:
    {id, text, page}
    """
    chunks = []
    chunk_id = 0

    for page_num, text in pages:
        paragraphs = [p.strip() for p in text.split("\n\n") if p.strip()]
        current = ""

        for para in paragraphs:
            # paragraph itself too big -> split it directly
            if len(para) > chunk_size:
                if current:
                    chunks.append({"id": chunk_id, "text": current, "page": page_num})
                    chunk_id += 1
                    current = ""
                for part in _split_large_paragraph(para, chunk_size, overlap):
                    chunks.append({"id": chunk_id, "text": part, "page": page_num})
                    chunk_id += 1
                continue

            # would adding this paragraph overflow the current chunk?
            if len(current) + len(para) + 1 > chunk_size:
                chunks.append({"id": chunk_id, "text": current, "page": page_num})
                chunk_id += 1
                current = para
            else:
                current = f"{current}\n{para}" if current else para

        if current:
            chunks.append({"id": chunk_id, "text": current, "page": page_num})
            chunk_id += 1

    logger.info("Created %d chunks", len(chunks))
    return chunks

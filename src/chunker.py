# """Step 2 of the pipeline: split page text into paragraph-aware chunks.

# Paragraphs are kept whole and packed together up to CHUNK_SIZE.
# A paragraph larger than CHUNK_SIZE is split with overlap so no chunk
# exceeds the limit.
# """

# import logging
# from src.config import CHUNK_SIZE, CHUNK_OVERLAP

# logger = logging.getLogger(__name__)


# def _split_large_paragraph(text, size, overlap):
#     parts = []
#     start = 0
#     while start < len(text):
#         end = start + size
#         parts.append(text[start:end])
#         start += size - overlap
#     return parts


# def chunk_pages(pages, chunk_size=CHUNK_SIZE, overlap=CHUNK_OVERLAP):
#     """Turn [(page_num, text), ...] into a list of chunk dicts:
#     {id, text, page}
#     """
#     chunks = []
#     chunk_id = 0

#     for page_num, text in pages:
#         paragraphs = [p.strip() for p in text.split("\n\n") if p.strip()]
#         current = ""

#         for para in paragraphs:
#             # paragraph itself too big -> split it directly
#             if len(para) > chunk_size:
#                 if current:
#                     chunks.append({"id": chunk_id, "text": current, "page": page_num})
#                     chunk_id += 1
#                     current = ""
#                 for part in _split_large_paragraph(para, chunk_size, overlap):
#                     chunks.append({"id": chunk_id, "text": part, "page": page_num})
#                     chunk_id += 1
#                 continue

#             # would adding this paragraph overflow the current chunk?
#             if len(current) + len(para) + 1 > chunk_size:
#                 chunks.append({"id": chunk_id, "text": current, "page": page_num})
#                 chunk_id += 1
#                 current = para
#             else:
#                 current = f"{current}\n{para}" if current else para

#         if current:
#             chunks.append({"id": chunk_id, "text": current, "page": page_num})
#             chunk_id += 1

#     logger.info("Created %d chunks", len(chunks))
#     return chunks

"""Step 2 of the pipeline: split each document's page text into
paragraph-aware chunks.

Every document is chunked independently (so paragraphs from different
PDFs are never merged into the same chunk), but chunk ids are assigned
globally so all chunks can live in one flat list / one FAISS index.
"""

import logging
from src.config import CHUNK_SIZE, CHUNK_OVERLAP

logger = logging.getLogger(__name__)


def _split_large_paragraph(text, size, overlap):
    """Split a paragraph that exceeds the chunk size, with overlap."""
    parts = []
    start = 0
    while start < len(text):
        end = start + size
        parts.append(text[start:end])
        start += size - overlap
    return parts


def _chunk_single_document(filename, pages, chunk_size, overlap, next_id):
    """Chunk one document's pages. Returns (chunks, next_free_id)."""
    chunks = []
    current = ""
    current_page = None

    def flush():
        nonlocal current
        if current:
            chunks.append(
                {
                    "id": next_id + len(chunks),
                    "filename": filename,
                    "page": current_page,
                    "text": current,
                }
            )
            current = ""

    for page_num, text in pages:
        paragraphs = [p.strip() for p in text.split("\n\n") if p.strip()]

        for para in paragraphs:
            if len(para) > chunk_size:
                flush()
                for part in _split_large_paragraph(para, chunk_size, overlap):
                    current, current_page = part, page_num
                    flush()
                continue

            if len(current) + len(para) + 1 > chunk_size:
                flush()
                current, current_page = para, page_num
            else:
                current = f"{current}\n{para}" if current else para
                current_page = page_num

        flush()  # end of page: don't let a chunk span across pages

    return chunks, next_id + len(chunks)


def chunk_documents(documents, chunk_size=CHUNK_SIZE, overlap=CHUNK_OVERLAP):
    """Chunk every document, assigning globally unique, sequential ids.

    Returns a single flat list of chunk dicts:
    {id, filename, page, text}
    """
    all_chunks = []
    next_id = 0

    for doc in documents:
        doc_chunks, next_id = _chunk_single_document(
            doc["filename"], doc["pages"], chunk_size, overlap, next_id
        )
        logger.info("Chunked %s into %d chunks", doc["filename"], len(doc_chunks))
        all_chunks.extend(doc_chunks)

    logger.info("Total chunks across all documents: %d", len(all_chunks))
    return all_chunks
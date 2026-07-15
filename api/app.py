"""FastAPI adapter over the existing RAG pipeline.

This module contains ONLY HTTP concerns: routing, request parsing,
response shaping, CORS, cookies, and error translation. Every actual
RAG operation is delegated to src.pipeline / src.generator / src.memory
— the exact same functions query.py already calls. Nothing here
duplicates retrieval, generation, ingestion, or citation logic.

Run with:
    uvicorn api.app:app --reload
"""

import json
import logging
import os
import shutil

from fastapi import FastAPI, File, HTTPException, Request, Response, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, StreamingResponse

from src.logging_setup import setup_logging
from src.config import (
    DATA_DIR,
    OLLAMA_MODEL,
    EMBEDDING_MODEL,
    HYBRID_SEARCH,
    RERANK,
    TOP_K,
    MAX_HISTORY,
)
from src.pipeline import ingest, answer_question, answer_question_stream
from src.generator import format_sources
from api import session
from api.schemas import (
    HealthResponse,
    InfoResponse,
    DocumentInfo,
    DocumentListResponse,
    UploadResponse,
    ChatRequest,
    ChatResponse,
    SourceItem,
    SessionClearResponse,
)

setup_logging()  # reuses the existing logging config, no new logger setup
logger = logging.getLogger(__name__)

SESSION_COOKIE = "rag_session_id"

app = FastAPI(title="RAG From Scratch API", version="1.0.0")

# Frontend origin should be tightened in production; open for local dev.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def _ensure_data_dir():
    # Infra housekeeping only — loader.py already requires this directory
    # to exist; the CLI relies on it having been created manually before.
    os.makedirs(DATA_DIR, exist_ok=True)


@app.exception_handler(Exception)
def handle_unexpected_exception(request: Request, exc: Exception):
    logger.exception("Unhandled error on %s %s", request.method, request.url.path)
    return JSONResponse(status_code=500, content={"detail": "Internal server error."})


def _get_session(request: Request, response: Response):
    """Resolve the caller's session (via cookie), creating one if needed,
    and make sure the cookie is set on the response either way.
    """
    session_id = request.cookies.get(SESSION_COOKIE)
    session_id, memory = session.get_or_create(session_id)
    response.set_cookie(SESSION_COOKIE, session_id, httponly=True, samesite="lax")
    return memory


# --- Health & info -----------------------------------------------------

@app.get("/health", response_model=HealthResponse)
def health():
    return HealthResponse(status="ok")


@app.get("/info", response_model=InfoResponse)
def info():
    """Read-only snapshot of the active config, for frontend display."""
    return InfoResponse(
        ollama_model=OLLAMA_MODEL,
        embedding_model=EMBEDDING_MODEL,
        hybrid_search=HYBRID_SEARCH,
        rerank=RERANK,
        top_k=TOP_K,
        max_history=MAX_HISTORY,
    )


# --- Documents -----------------------------------------------------------

@app.get("/documents", response_model=DocumentListResponse)
def list_documents():
    """Lists filenames present in DATA_DIR. Plain filesystem read — no
    pipeline function exists for "list ingested files" so this doesn't
    call into src/ at all, it just mirrors what ingest.py would find.
    """
    if not os.path.isdir(DATA_DIR):
        return DocumentListResponse(documents=[])
    filenames = sorted(f for f in os.listdir(DATA_DIR) if f.lower().endswith(".pdf"))
    return DocumentListResponse(documents=[DocumentInfo(filename=f) for f in filenames])


@app.post("/documents", response_model=UploadResponse)
def upload_document(file: UploadFile = File(...)):
    """Saves the uploaded PDF into DATA_DIR, then calls the existing
    pipeline.ingest() unchanged — exactly what `python ingest.py` does,
    just triggered over HTTP instead of the CLI. ingest() has no
    single-file mode, so this reprocesses every PDF in DATA_DIR, same
    as re-running the CLI script would.
    """
    if not file.filename or not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are accepted.")

    os.makedirs(DATA_DIR, exist_ok=True)
    destination = os.path.join(DATA_DIR, file.filename)

    try:
        with open(destination, "wb") as out:
            shutil.copyfileobj(file.file, out)
    except OSError as e:
        logger.error("Failed to save upload '%s': %s", file.filename, e)
        raise HTTPException(status_code=500, detail="Could not save the uploaded file.")
    finally:
        file.file.close()

    try:
        chunks = ingest()  # existing pipeline function, unmodified
    except Exception as e:
        logger.error("Ingestion failed for '%s': %s", file.filename, e)
        if os.path.exists(destination):
            os.remove(destination)  # don't leave a file that will fail every future ingest
        raise HTTPException(
            status_code=422,
            detail=f"Could not process '{file.filename}'. It may be corrupted or not a valid PDF.",
        )

    total_documents = len({c["filename"] for c in chunks})
    return UploadResponse(
        filename=file.filename,
        total_documents=total_documents,
        total_chunks=len(chunks),
    )


# --- Chat ------------------------------------------------------------------

@app.post("/chat", response_model=ChatResponse)
def chat(payload: ChatRequest, request: Request, response: Response):
    """Blocking chat: wraps pipeline.answer_question() exactly as
    query.py's non-streaming path does, including passing session
    history and formatting sources via generator.format_sources().
    """
    memory = _get_session(request, response)
    top_k = payload.top_k or TOP_K

    try:
        retrieved, answer = answer_question(
            payload.question, top_k=top_k, history=memory.get_recent()
        )
    except (FileNotFoundError, RuntimeError):
        # Raised by src.vectorstore.load() when no index has been built yet.
        raise HTTPException(
            status_code=404,
            detail="No documents have been ingested yet. Upload a PDF first.",
        )
    except Exception as e:
        # Retrieval succeeded structurally by this point; a failure here
        # is almost always the Ollama call itself.
        logger.error("Generation failed: %s", e)
        raise HTTPException(
            status_code=503,
            detail="The language model backend is unavailable. Make sure Ollama is running.",
        )

    memory.add(payload.question, answer)  # same call query.py makes after each turn

    sources = [SourceItem(filename=f, pages=p) for f, p in format_sources(retrieved)]
    return ChatResponse(answer=answer, sources=sources)


@app.post("/chat/stream")
def chat_stream(payload: ChatRequest, request: Request, response: Response):
    """Streaming chat: wraps pipeline.answer_question_stream(). The
    generator it returns (from generator.generate_answer_stream) is
    consumed as-is, piece by piece — this function does not alter how
    those pieces are produced, only how each one is framed for HTTP.

    Emits newline-delimited JSON:
      {"type": "sources", "sources": [...]}   - sent once, up front
      {"type": "chunk", "text": "..."}        - sent per streamed piece
      {"type": "done"}                        - sent once, at the end
      {"type": "error", "detail": "..."}      - sent if the stream breaks
    """
    memory = _get_session(request, response)
    top_k = payload.top_k or TOP_K

    try:
        retrieved, answer_stream = answer_question_stream(
            payload.question, top_k=top_k, history=memory.get_recent()
        )
    except (FileNotFoundError, RuntimeError):
        raise HTTPException(
            status_code=404,
            detail="No documents have been ingested yet. Upload a PDF first.",
        )
    except Exception as e:
        logger.error("Retrieval failed before streaming could start: %s", e)
        raise HTTPException(status_code=500, detail="Retrieval failed unexpectedly.")

    sources_payload = [
        {"filename": f, "pages": p} for f, p in format_sources(retrieved)
    ]

    def event_stream():
        yield json.dumps({"type": "sources", "sources": sources_payload}) + "\n"

        pieces = []
        try:
            for piece in answer_stream:  # existing generator, consumed unmodified
                pieces.append(piece)
                yield json.dumps({"type": "chunk", "text": piece}) + "\n"
        except Exception as e:
            # A failure here means partial text may already have reached
            # the client — matches generate_answer_stream()'s own policy
            # of not silently retrying after partial output.
            logger.error("Streaming interrupted: %s", e)
            yield json.dumps(
                {"type": "error", "detail": "The response was interrupted. Please try again."}
            ) + "\n"
            return

        memory.add(payload.question, "".join(pieces))  # same as query.py after streaming ends
        yield json.dumps({"type": "done"}) + "\n"

    return StreamingResponse(
        event_stream(),
        media_type="application/x-ndjson",
        headers=dict(response.headers),  # carries the session cookie set above
    )


# --- Session ---------------------------------------------------------------

@app.post("/session/clear", response_model=SessionClearResponse)
def clear_session(request: Request):
    """Clears this session's ConversationMemory via ConversationMemory.clear()
    — the same method src/memory.py already exposes, unmodified.
    """
    session_id = request.cookies.get(SESSION_COOKIE)
    if session_id:
        session.clear(session_id)
    return SessionClearResponse(status="cleared")

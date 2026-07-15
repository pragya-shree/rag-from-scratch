"""Request/response models for the API layer.

These describe HTTP shapes only. They mirror the data that already
flows through src.pipeline and src.generator (chunks, sources, answers)
without changing or duplicating how that data is produced.
"""

from typing import List, Optional
from pydantic import BaseModel, Field


class HealthResponse(BaseModel):
    status: str


class InfoResponse(BaseModel):
    """Read-only snapshot of the active config — nothing computed here."""
    ollama_model: str
    embedding_model: str
    hybrid_search: bool
    rerank: bool
    top_k: int
    max_history: int


class DocumentInfo(BaseModel):
    filename: str


class DocumentListResponse(BaseModel):
    documents: List[DocumentInfo]


class UploadResponse(BaseModel):
    filename: str
    total_documents: int
    total_chunks: int


class ChatRequest(BaseModel):
    question: str = Field(..., min_length=1)
    top_k: Optional[int] = None


class SourceItem(BaseModel):
    filename: str
    pages: List[int]


class ChatResponse(BaseModel):
    answer: str
    sources: List[SourceItem]


class SessionClearResponse(BaseModel):
    status: str


class ErrorResponse(BaseModel):
    detail: str

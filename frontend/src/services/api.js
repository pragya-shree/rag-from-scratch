import axios from "axios";

/**
 * Single Axios instance for all backend communication. The base URL
 * comes from an environment variable — see .env.example.
 *
 * withCredentials is required: the backend issues a session cookie
 * (rag_session_id, httponly) on /chat and /session/clear, and expects
 * it back on every request to keep conversation memory tied to this
 * browser session. Without this, every request would look like a new
 * session to the backend.
 */
const BASE_URL = import.meta.env.VITE_API_BASE_URL;

if (!BASE_URL) {
  console.warn(
    "VITE_API_BASE_URL is not set. Copy .env.example to .env and set it."
  );
}

export const apiClient = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  headers: {
    Accept: "application/json",
  },
});

/**
 * --- Real backend contract (verified) ---
 * GET  /health          -> { status: "ok" }
 * GET  /info             -> { ollama_model, embedding_model, hybrid_search, rerank, top_k, max_history }
 * GET  /documents        -> { documents: [{ filename }] }
 * POST /documents        -> multipart "file" -> { filename, total_documents, total_chunks }
 * DELETE /documents/{filename} -> { filename, total_documents, total_chunks }
 * POST /chat              -> { question, top_k? } -> { answer, sources: [{ filename, pages }] }
 * POST /chat/stream        -> { question, top_k? } -> NDJSON stream (see chatStream.js)
 * POST /session/clear      -> {} -> { status: "cleared" }
 */

export async function getHealth() {
  const { data } = await apiClient.get("/health");
  return data;
}

export async function getInfo() {
  const { data } = await apiClient.get("/info");
  return data;
}

export async function listDocuments() {
  const { data } = await apiClient.get("/documents");
  return data.documents;
}

export async function uploadDocument(file, onUploadProgress) {
  const formData = new FormData();
  formData.append("file", file);

  const { data } = await apiClient.post("/documents", formData, {
    headers: { "Content-Type": "multipart/form-data" },
    onUploadProgress,
  });
  return data;
}

export async function deleteDocument(filename) {
  const { data } = await apiClient.delete(
    `/documents/${encodeURIComponent(filename)}`
  );
  return data;
}

/**
 * Non-streaming chat. Used as a fallback if the streaming request can't
 * even be established (e.g. the browser blocks the fetch outright).
 * Session history is NOT sent from the client — the backend keeps
 * conversation memory server-side, keyed by the session cookie.
 */
export async function sendChatMessage(question, topK) {
  const { data } = await apiClient.post("/chat", {
    question,
    ...(topK ? { top_k: topK } : {}),
  });
  return data;
}

export async function clearSession() {
  const { data } = await apiClient.post("/session/clear");
  return data;
}

export default apiClient;

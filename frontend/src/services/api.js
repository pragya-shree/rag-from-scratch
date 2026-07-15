import axios from "axios";

/**
 * Single Axios instance for all backend communication. The base URL
 * comes from an environment variable so nothing is hardcoded — see
 * .env.example. Vite exposes variables prefixed with VITE_ on
 * import.meta.env at build time.
 */
const BASE_URL = import.meta.env.VITE_API_BASE_URL;

if (!BASE_URL) {
  // Fail loudly in development rather than silently hitting a wrong host.
  console.warn(
    "VITE_API_BASE_URL is not set. Copy .env.example to .env and set it."
  );
}

export const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    Accept: "application/json",
  },
});

/**
 * --- Document endpoints ---
 * These assume a FastAPI backend exposing:
 *   POST   /documents            (multipart/form-data, field "file")
 *   GET    /documents            -> [{ filename, pages, uploaded_at }]
 *   DELETE /documents/{filename}
 *   POST   /session/clear
 * Adjust the paths below if your backend's routes differ — this file
 * is the only place that needs to change.
 */

export async function uploadDocument(file, onUploadProgress) {
  const formData = new FormData();
  formData.append("file", file);

  const { data } = await apiClient.post("/documents", formData, {
    headers: { "Content-Type": "multipart/form-data" },
    onUploadProgress,
  });
  return data;
}

export async function listDocuments() {
  const { data } = await apiClient.get("/documents");
  return data;
}

export async function deleteDocument(filename) {
  const { data } = await apiClient.delete(
    `/documents/${encodeURIComponent(filename)}`
  );
  return data;
}

export async function clearSession() {
  const { data } = await apiClient.post("/session/clear");
  return data;
}

/**
 * Streaming chat is handled separately (via fetch + ReadableStream,
 * not Axios, since Axios does not support incrementally reading a
 * response body in the browser). See hooks/useChat.js and
 * services/chatStream.js for that flow — this file stays focused on
 * plain request/response REST calls.
 */

export default apiClient;

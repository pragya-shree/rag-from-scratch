/**
 * Streaming client for POST /chat/stream — the backend's real protocol.
 *
 * The endpoint responds one of two ways:
 * 1. An error BEFORE streaming starts (no documents ingested, retrieval
 *    failure) -> a normal JSON error response, status >= 400, body
 *    { detail: "..." }. This happens when the backend can't even begin
 *    generating, so it never opens the stream.
 * 2. A 200 response with a newline-delimited JSON body, one event per
 *    line:
 *      {"type": "sources", "sources": [{filename, pages}, ...]}  - once, first
 *      {"type": "chunk", "text": "..."}                          - per piece
 *      {"type": "done"}                                          - once, last
 *      {"type": "error", "detail": "..."}                        - if the
 *        stream is interrupted after some text was already sent; any
 *        chunks already yielded before this are real partial output.
 *
 * withCredentials isn't a fetch concept — the equivalent is
 * `credentials: "include"`, required so the session cookie is sent and
 * so the Set-Cookie the backend issues on first contact is honored.
 */

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

export async function streamChatResponse(
  question,
  { onChunk, onSources, onDone, onError },
  signal
) {
  let response;
  try {
    response = await fetch(`${BASE_URL}/chat/stream`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ question }),
      signal,
    });
  } catch (networkError) {
    if (networkError.name !== "AbortError") {
      onError?.(new Error("Can't reach the backend. Is the server running?"));
    }
    return;
  }

  if (!response.ok) {
    // Errors raised before the stream opens arrive as plain JSON, not NDJSON.
    let detail = "The assistant couldn't respond. Please try again.";
    try {
      const body = await response.json();
      if (body?.detail) detail = body.detail;
    } catch {
      // body wasn't JSON; fall back to the generic message above
    }
    onError?.(new Error(detail));
    return;
  }

  if (!response.body) {
    onError?.(new Error("The server response could not be read."));
    return;
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop(); // keep the last, possibly incomplete line

      for (const line of lines) {
        if (!line.trim()) continue;
        const event = JSON.parse(line);

        if (event.type === "sources") onSources?.(event.sources);
        else if (event.type === "chunk") onChunk?.(event.text);
        else if (event.type === "error") {
          onError?.(new Error(event.detail || "The response was interrupted."));
          return;
        } else if (event.type === "done") {
          onDone?.();
          return;
        }
      }
    }
    onDone?.();
  } catch (error) {
    if (error.name !== "AbortError") {
      onError?.(new Error("The connection was lost while responding."));
    }
  }
}

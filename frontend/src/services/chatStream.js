/**
 * Streaming is handled outside Axios because the browser's Fetch API
 * exposes the response body as a ReadableStream, which is what lets us
 * render the assistant's answer token-by-token as it arrives from the
 * backend's streaming Ollama endpoint.
 *
 * Assumes a FastAPI endpoint:
 *   POST /chat  { question, history }
 *   -> text/event-stream, one JSON object per line/event:
 *      { type: "chunk", text: "..." }
 *      { type: "sources", sources: [{ filename, pages: [..] }] }
 *      { type: "done" }
 * Adjust the parsing in `streamChatResponse` if your backend's event
 * shape differs — this is the only place that needs to change.
 */

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

/**
 * Streams a chat answer, invoking callbacks as data arrives.
 *
 * @param {string} question
 * @param {Array<{question: string, answer: string}>} history
 * @param {object} callbacks
 * @param {(text: string) => void} callbacks.onChunk - called per text piece
 * @param {(sources: Array) => void} callbacks.onSources - called once, if sent
 * @param {() => void} callbacks.onDone - called when the stream completes
 * @param {(error: Error) => void} callbacks.onError
 * @param {AbortSignal} [signal] - optional, to cancel an in-flight request
 */
export async function streamChatResponse(
  question,
  history,
  { onChunk, onSources, onDone, onError },
  signal
) {
  try {
    const response = await fetch(`${BASE_URL}/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question, history }),
      signal,
    });

    if (!response.ok || !response.body) {
      throw new Error(`Chat request failed with status ${response.status}`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop(); // keep the last, possibly incomplete line

      for (const line of lines) {
        if (!line.trim()) continue;
        const event = JSON.parse(line);

        if (event.type === "chunk") onChunk?.(event.text);
        else if (event.type === "sources") onSources?.(event.sources);
        else if (event.type === "done") onDone?.();
      }
    }

    onDone?.();
  } catch (error) {
    if (error.name !== "AbortError") onError?.(error);
  }
}

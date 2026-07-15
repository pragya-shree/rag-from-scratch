import { useCallback, useRef, useState } from "react";
import { streamChatResponse } from "../services/chatStream";

/**
 * Owns the conversation: message list, in-flight streaming state, and
 * errors. A message looks like:
 *   { id, role: "user" | "assistant", content, sources?, isStreaming? }
 *
 * History sent to the backend is derived from completed messages only
 * (matches the backend's session-memory shape of (question, answer)
 * pairs) — it is not a separate piece of state to keep in sync.
 */
export function useChat() {
  const [messages, setMessages] = useState([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState(null);
  const abortRef = useRef(null);

  const buildHistory = useCallback((allMessages) => {
    const history = [];
    for (let i = 0; i < allMessages.length - 1; i += 1) {
      const current = allMessages[i];
      const next = allMessages[i + 1];
      if (current.role === "user" && next?.role === "assistant") {
        history.push({ question: current.content, answer: next.content });
      }
    }
    return history;
  }, []);

  const sendMessage = useCallback(
    async (question) => {
      const trimmed = question.trim();
      if (!trimmed || isStreaming) return;

      setError(null);
      const userMessage = { id: crypto.randomUUID(), role: "user", content: trimmed };
      const assistantId = crypto.randomUUID();
      const assistantMessage = {
        id: assistantId,
        role: "assistant",
        content: "",
        sources: [],
        isStreaming: true,
      };

      setMessages((prev) => [...prev, userMessage, assistantMessage]);
      setIsStreaming(true);

      const controller = new AbortController();
      abortRef.current = controller;

      const history = buildHistory(messages);

      await streamChatResponse(
        trimmed,
        history,
        {
          onChunk: (text) => {
            setMessages((prev) =>
              prev.map((m) =>
                m.id === assistantId ? { ...m, content: m.content + text } : m
              )
            );
          },
          onSources: (sources) => {
            setMessages((prev) =>
              prev.map((m) => (m.id === assistantId ? { ...m, sources } : m))
            );
          },
          onDone: () => {
            setMessages((prev) =>
              prev.map((m) =>
                m.id === assistantId ? { ...m, isStreaming: false } : m
              )
            );
            setIsStreaming(false);
          },
          onError: (err) => {
            console.error(err);
            setError("The assistant couldn't finish responding. Try again.");
            setMessages((prev) =>
              prev.map((m) =>
                m.id === assistantId ? { ...m, isStreaming: false } : m
              )
            );
            setIsStreaming(false);
          },
        },
        controller.signal
      );
    },
    [messages, isStreaming, buildHistory]
  );

  const stopStreaming = useCallback(() => {
    abortRef.current?.abort();
    setIsStreaming(false);
  }, []);

  const clearMessages = useCallback(() => {
    setMessages([]);
    setError(null);
  }, []);

  return { messages, isStreaming, error, sendMessage, stopStreaming, clearMessages };
}

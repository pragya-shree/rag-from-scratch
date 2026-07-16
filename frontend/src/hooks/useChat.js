import { useCallback, useRef, useState } from "react";
import { streamChatResponse } from "../services/chatStream";

/**
 * Owns the conversation transcript and streaming state.
 *
 * Conversation memory is NOT tracked here and NOT sent to the backend —
 * the API's session cookie already ties conversation memory to this
 * browser session server-side (ConversationMemory, per /chat's actual
 * request schema: { question, top_k? }, no history field). This hook
 * only keeps messages for rendering the transcript.
 */
export function useChat() {
  const [messages, setMessages] = useState([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState(null);
  const abortRef = useRef(null);
  // Mirrors isStreaming for sendMessage's guard, so the callback doesn't
  // need isStreaming in its dependency array (that would recreate it,
  // and every prop/handler built from it, on every streamed token).
  const isStreamingRef = useRef(false);

  const sendMessage = useCallback(async (question) => {
    const trimmed = question.trim();
    if (!trimmed || isStreamingRef.current) return;

    setError(null);
    const userMessage = { id: crypto.randomUUID(), role: "user", content: trimmed };
    const assistantId = crypto.randomUUID();
    const assistantMessage = {
      id: assistantId,
      role: "assistant",
      content: "",
      sources: [],
      isStreaming: true,
      wasInterrupted: false,
    };

    setMessages((prev) => [...prev, userMessage, assistantMessage]);
    setIsStreaming(true);
    isStreamingRef.current = true;

    const controller = new AbortController();
    abortRef.current = controller;

    await streamChatResponse(
      trimmed,
      {
        onSources: (sources) => {
          setMessages((prev) =>
            prev.map((m) => (m.id === assistantId ? { ...m, sources } : m))
          );
        },
        onChunk: (text) => {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantId ? { ...m, content: m.content + text } : m
            )
          );
        },
        onDone: () => {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantId ? { ...m, isStreaming: false } : m
            )
          );
          setIsStreaming(false);
          isStreamingRef.current = false;
        },
        onError: (err) => {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantId
                ? { ...m, isStreaming: false, wasInterrupted: true }
                : m
            )
          );
          setError(err.message);
          setIsStreaming(false);
          isStreamingRef.current = false;
        },
      },
      controller.signal
    );
  }, []);

  const stopStreaming = useCallback(() => {
    abortRef.current?.abort();
    setIsStreaming(false);
    isStreamingRef.current = false;
  }, []);

  const clearMessages = useCallback(() => {
    setMessages([]);
    setError(null);
  }, []);

  return { messages, isStreaming, error, sendMessage, stopStreaming, clearMessages };
}

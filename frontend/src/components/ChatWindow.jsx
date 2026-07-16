import { useEffect, useRef } from "react";
import ChatMessage from "./ChatMessage";
import EmptyState from "./EmptyState";

/**
 * The scrollable conversation area between the Header and ChatInput.
 * Auto-scrolls to the latest message as new content streams in.
 */
export default function ChatWindow({ messages, hasDocuments, onSend }) {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages]);

  if (messages.length === 0) {
    return (
      <div className="flex-1 overflow-y-auto">
        <EmptyState hasDocuments={hasDocuments} onExampleClick={onSend} />
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="mx-auto flex max-w-3xl flex-col gap-6 py-6">
        {messages.map((message) => (
          <ChatMessage key={message.id} message={message} />
        ))}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}

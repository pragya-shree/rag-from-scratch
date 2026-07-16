import Header from "../components/Header";
import ChatWindow from "../components/ChatWindow";
import ChatInput from "../components/ChatInput";
import Footer from "../components/Footer";

/**
 * Main content column: header, conversation, input, footer. Purely
 * presentational — all state (messages, streaming, documents, backend
 * info) is owned by App and passed down, so Sidebar's "clear
 * conversation" button can reset the same chat state this page renders.
 */
export default function ChatPage({
  documentCount,
  messages,
  isStreaming,
  chatError,
  onSend,
  onStop,
  info,
}) {
  return (
    <div className="flex h-full flex-1 flex-col">
      <Header documentCount={documentCount} />

      <ChatWindow messages={messages} hasDocuments={documentCount > 0} onSend={onSend} />

      {chatError && (
        <div className="animate-fade-in mx-6 mb-2 flex items-center gap-2 rounded-xl border border-accent-pink/25 bg-accent-pink/[0.08] px-3.5 py-2 text-xs text-accent-pink">
          {chatError}
        </div>
      )}

      <ChatInput
        onSend={onSend}
        isStreaming={isStreaming}
        onStop={onStop}
        disabled={documentCount === 0}
      />

      <Footer info={info} />
    </div>
  );
}

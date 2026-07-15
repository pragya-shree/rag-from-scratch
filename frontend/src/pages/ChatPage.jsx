import Header from "../components/Header";
import ChatWindow from "../components/ChatWindow";
import ChatInput from "../components/ChatInput";
import { useChat } from "../hooks/useChat";

/**
 * The main content column: header, conversation, input. Receives
 * document state from App (so Header can show the document count)
 * but owns conversation state itself via useChat.
 */
export default function ChatPage({ documentCount }) {
  const { messages, isStreaming, error, sendMessage, stopStreaming } = useChat();

  return (
    <div className="flex h-full flex-1 flex-col">
      <Header documentCount={documentCount} />

      <ChatWindow messages={messages} hasDocuments={documentCount > 0} />

      {error && (
        <div className="mx-6 mb-2 rounded-lg border border-red-900/40 bg-red-950/30 px-3.5 py-2 text-xs text-red-300">
          {error}
        </div>
      )}

      <ChatInput
        onSend={sendMessage}
        isStreaming={isStreaming}
        onStop={stopStreaming}
        disabled={documentCount === 0}
      />
    </div>
  );
}

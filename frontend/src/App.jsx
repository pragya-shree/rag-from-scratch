import Sidebar from "./components/Sidebar";
import ChatPage from "./pages/ChatPage";
import { useDocuments } from "./hooks/useDocuments";
import { useChat } from "./hooks/useChat";
import { useBackendStatus } from "./hooks/useBackendStatus";
import { clearSession } from "./services/api";
import { getErrorMessage } from "./utils/errorMessages";

export default function App() {
  const {
    documents,
    isLoading: isLoadingDocuments,
    isUploading,
    uploadProgress,
    upload,
  } = useDocuments();

  const { messages, isStreaming, error: chatError, sendMessage, stopStreaming, clearMessages } =
    useChat();

  const { isOnline: isBackendOnline, info } = useBackendStatus();

  const handleClearSession = async () => {
    try {
      await clearSession();
    } catch (err) {
      // Clearing local state below still gives the user a fresh chat
      // even if the backend call failed (e.g. it was already offline).
      console.error("Could not clear the backend session:", getErrorMessage(err));
    }
    clearMessages();
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-ink-950">
      <Sidebar
        documents={documents}
        isLoadingDocuments={isLoadingDocuments}
        isUploading={isUploading}
        uploadProgress={uploadProgress}
        onUpload={upload}
        onClearSession={handleClearSession}
        isBackendOnline={isBackendOnline}
      />
      <ChatPage
        documentCount={documents.length}
        messages={messages}
        isStreaming={isStreaming}
        chatError={chatError}
        onSend={sendMessage}
        onStop={stopStreaming}
        info={info}
      />
    </div>
  );
}

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
    deletingFilename,
    upload,
    remove,
  } = useDocuments();

  const { messages, isStreaming, error: chatError, sendMessage, stopStreaming, clearMessages } =
    useChat();

  const { isOnline: isBackendOnline, info } = useBackendStatus();

  const handleClearSession = async () => {
    try {
      await clearSession();
    } catch (err) {
      console.error("Could not clear the backend session:", getErrorMessage(err));
    }
    clearMessages();
  };

  return (
    <div className="relative flex h-screen w-screen overflow-hidden bg-midnight-950">
      {/* Floating blurred gradient blobs — fixed, decorative, behind everything */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden="true">
        <div className="animate-blob-float absolute -left-32 -top-40 h-[32rem] w-[32rem] rounded-full bg-accent-purple/25 blur-[110px]" />
        <div className="animate-blob-float-slow absolute -right-32 top-1/4 h-[28rem] w-[28rem] rounded-full bg-accent-cyan/15 blur-[110px]" />
        <div className="animate-blob-float absolute bottom-[-10rem] left-1/3 h-[26rem] w-[26rem] rounded-full bg-accent-pink/15 blur-[110px]" />
      </div>

      <div className="relative z-10 flex h-full w-full">
        <Sidebar
          documents={documents}
          isLoadingDocuments={isLoadingDocuments}
          isUploading={isUploading}
          uploadProgress={uploadProgress}
          deletingFilename={deletingFilename}
          onUpload={upload}
          onRemove={remove}
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
    </div>
  );
}

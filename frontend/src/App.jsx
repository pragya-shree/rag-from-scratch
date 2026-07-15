import Sidebar from "./components/Sidebar";
import ChatPage from "./pages/ChatPage";
import { useDocuments } from "./hooks/useDocuments";
import { clearSession } from "./services/api";

export default function App() {
  const { documents, isUploading, upload, remove } = useDocuments();

  const handleClearSession = async () => {
    try {
      await clearSession();
      // Conversation memory lives inside ChatPage's useChat state; a
      // full reload is the simplest way to reset both the backend
      // session and the in-memory chat history together.
      window.location.reload();
    } catch (err) {
      console.error("Could not clear session:", err);
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-ink-950">
      <Sidebar
        documents={documents}
        isUploading={isUploading}
        onUpload={upload}
        onRemove={remove}
        onClearSession={handleClearSession}
      />
      <ChatPage documentCount={documents.length} />
    </div>
  );
}

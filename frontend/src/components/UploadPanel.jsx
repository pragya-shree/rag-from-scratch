import { useRef, useState } from "react";
import { FileText, CheckCircle2, AlertCircle, Upload } from "lucide-react";
import LoadingSpinner from "./LoadingSpinner";

/**
 * Drag-and-drop / click-to-browse PDF upload, plus the list of
 * documents already ingested. There is no remove/delete action here:
 * the backend has no DELETE /documents endpoint, so a document, once
 * uploaded, stays for the session — matching what the API supports.
 */
export default function UploadPanel({
  documents,
  isLoading,
  isUploading,
  uploadProgress,
  onUpload,
}) {
  const [isDragging, setIsDragging] = useState(false);
  const [feedback, setFeedback] = useState(null); // { type: "success" | "error", message }
  const inputRef = useRef(null);

  const handleFiles = async (fileList) => {
    const file = fileList?.[0];
    if (!file) return;

    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
      setFeedback({ type: "error", message: "Only PDF files are accepted." });
      return;
    }

    setFeedback(null);
    const result = await onUpload(file);
    if (result.success) {
      setFeedback({ type: "success", message: `"${file.name}" is ready to query.` });
    } else {
      setFeedback({ type: "error", message: result.message });
    }
    setTimeout(() => setFeedback(null), 5000);
  };

  return (
    <div className="space-y-3">
      <p className="px-0.5 text-xs font-medium uppercase tracking-wide text-text-muted">
        Documents
      </p>

      {/* Drop zone */}
      <div
        role="button"
        tabIndex={0}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => e.key === "Enter" && inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          handleFiles(e.dataTransfer.files);
        }}
        className={`flex cursor-pointer flex-col items-center gap-2 rounded-xl border border-dashed px-4 py-6 text-center transition-colors ${
          isDragging
            ? "border-accent-gold bg-accent-gold-soft"
            : "border-border-800 bg-surface-800/50 hover:border-text-muted"
        }`}
      >
        {isUploading ? (
          <>
            <LoadingSpinner size={20} />
            <div className="h-1 w-full overflow-hidden rounded-full bg-surface-700">
              <div
                className="h-full rounded-full bg-accent-gold transition-all duration-200"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
            <p className="text-xs text-text-secondary">Processing… {uploadProgress}%</p>
          </>
        ) : (
          <>
            <Upload size={20} className="text-text-secondary" strokeWidth={1.75} />
            <p className="text-xs leading-relaxed text-text-secondary">
              <span className="text-accent-gold">Click to upload</span> or drag a PDF here
            </p>
          </>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="application/pdf"
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>

      {/* Upload feedback */}
      {feedback && (
        <div
          role="status"
          className={`flex items-start gap-2 rounded-lg px-3 py-2 text-xs leading-relaxed ${
            feedback.type === "success"
              ? "bg-accent-gold-soft text-text-primary"
              : "bg-red-950/40 text-red-300"
          }`}
        >
          {feedback.type === "success" ? (
            <CheckCircle2 size={14} className="mt-0.5 shrink-0 text-accent-gold" />
          ) : (
            <AlertCircle size={14} className="mt-0.5 shrink-0 text-red-400" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Uploaded list */}
      {isLoading ? (
        <div className="flex items-center gap-2 px-2.5 py-2 text-xs text-text-muted">
          <LoadingSpinner size={12} />
          Loading documents…
        </div>
      ) : documents.length > 0 ? (
        <ul className="space-y-1.5">
          {documents.map((doc) => (
            <li
              key={doc.filename}
              className="flex items-center gap-2 rounded-lg px-2.5 py-2"
            >
              <FileText size={14} className="shrink-0 text-text-muted" />
              <span className="truncate text-sm text-text-secondary">
                {doc.filename}
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="px-2.5 py-1 text-xs text-text-muted">
          No documents yet — upload one to get started.
        </p>
      )}
    </div>
  );
}

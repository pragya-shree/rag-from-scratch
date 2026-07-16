import { useRef, useState } from "react";
import { FileText, CheckCircle2, AlertCircle, UploadCloud, Trash2 } from "lucide-react";
import LoadingSpinner from "./LoadingSpinner";

/**
 * Drag-and-drop / click-to-browse PDF upload, plus the list of
 * documents already ingested — each with a delete action.
 */
export default function UploadPanel({
  documents,
  isLoading,
  isUploading,
  uploadProgress,
  deletingFilename,
  onUpload,
  onRemove,
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

  const handleRemove = async (filename) => {
    const confirmed = window.confirm(
      `Delete "${filename}"? The index will be rebuilt from the remaining documents.`
    );
    if (!confirmed) return;

    setFeedback(null);
    const result = await onRemove(filename);
    if (result.success) {
      setFeedback({ type: "success", message: `"${filename}" was deleted.` });
    } else {
      setFeedback({ type: "error", message: result.message });
    }
    setTimeout(() => setFeedback(null), 5000);
  };

  return (
    <div className="space-y-3">
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
        className={`relative flex cursor-pointer flex-col items-center gap-2.5 overflow-hidden rounded-2xl border border-dashed px-4 py-7 text-center transition-all duration-300 ${
          isDragging
            ? "glow-purple scale-[1.02] border-accent-purple bg-accent-purple/10"
            : "border-white/15 bg-white/[0.02] hover:border-accent-cyan/40 hover:bg-white/[0.04]"
        }`}
      >
        {isUploading ? (
          <>
            <LoadingSpinner size={22} />
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-gradient-to-r from-accent-purple to-accent-cyan transition-all duration-200"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
            <p className="text-xs text-text-secondary">Processing… {uploadProgress}%</p>
          </>
        ) : (
          <>
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-accent-purple/25 to-accent-cyan/25">
              <UploadCloud size={17} className="text-accent-lavender" strokeWidth={1.75} />
            </div>
            <p className="text-xs leading-relaxed text-text-secondary">
              <span className="gradient-text font-medium">Click to upload</span> or drag a PDF here
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

      {/* Upload/delete feedback */}
      {feedback && (
        <div
          role="status"
          className={`animate-fade-in flex items-start gap-2 rounded-xl px-3 py-2 text-xs leading-relaxed ${
            feedback.type === "success"
              ? "border border-accent-cyan/20 bg-accent-cyan/[0.08] text-text-primary"
              : "border border-accent-pink/20 bg-accent-pink/[0.08] text-accent-pink"
          }`}
        >
          {feedback.type === "success" ? (
            <CheckCircle2 size={14} className="mt-0.5 shrink-0 text-accent-cyan" />
          ) : (
            <AlertCircle size={14} className="mt-0.5 shrink-0 text-accent-pink" />
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
        <ul className="space-y-2">
          {documents.map((doc) => {
            const isDeleting = deletingFilename === doc.filename;
            return (
              <li
                key={doc.filename}
                className="glass-card group flex items-center gap-2.5 rounded-xl px-3 py-2.5 transition-all duration-200 hover:-translate-y-0.5 hover:border-accent-purple/30"
              >
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-accent-purple/20 to-accent-cyan/20">
                  <FileText size={13} className="text-accent-lavender" />
                </div>
                <span className="truncate text-sm text-text-secondary" title={doc.filename}>
                  {doc.filename}
                </span>
                <button
                  type="button"
                  onClick={() => handleRemove(doc.filename)}
                  disabled={isDeleting}
                  aria-label={`Delete ${doc.filename}`}
                  className="ml-auto shrink-0 rounded-md p-1 text-text-muted opacity-0 transition-opacity hover:text-accent-pink disabled:cursor-not-allowed disabled:opacity-100 group-hover:opacity-100"
                >
                  {isDeleting ? <LoadingSpinner size={13} /> : <Trash2 size={13} />}
                </button>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="px-2.5 py-1 text-xs text-text-muted">
          No documents yet — upload one to get started.
        </p>
      )}
    </div>
  );
}

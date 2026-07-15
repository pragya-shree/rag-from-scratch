import { useRef, useState } from "react";
import { FileText, Trash2, Upload } from "lucide-react";
import LoadingSpinner from "./LoadingSpinner";
import { formatFileSize } from "../utils/formatters";

/**
 * Drag-and-drop / click-to-browse PDF upload area, plus the list of
 * documents already in the session. Kept as one component since the
 * upload zone and the list share the same "documents" visual block in
 * the sidebar.
 */
export default function UploadPanel({ documents, isUploading, onUpload, onRemove }) {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef(null);

  const handleFiles = (fileList) => {
    const file = fileList?.[0];
    if (file && file.type === "application/pdf") {
      onUpload(file);
    }
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
          <LoadingSpinner size={20} />
        ) : (
          <Upload size={20} className="text-text-secondary" strokeWidth={1.75} />
        )}
        <p className="text-xs leading-relaxed text-text-secondary">
          {isUploading ? (
            "Uploading…"
          ) : (
            <>
              <span className="text-accent-gold">Click to upload</span> or drag a PDF here
            </>
          )}
        </p>
        <input
          ref={inputRef}
          type="file"
          accept="application/pdf"
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>

      {/* Uploaded list */}
      {documents.length > 0 && (
        <ul className="space-y-1.5">
          {documents.map((doc) => (
            <li
              key={doc.filename}
              className="group flex items-center justify-between gap-2 rounded-lg px-2.5 py-2 transition-colors hover:bg-surface-800"
            >
              <span className="flex min-w-0 items-center gap-2">
                <FileText size={14} className="shrink-0 text-text-muted" />
                <span className="truncate text-sm text-text-secondary">
                  {doc.filename}
                </span>
              </span>

              <span className="flex shrink-0 items-center gap-1.5">
                {doc.size != null && (
                  <span className="font-mono text-[10px] text-text-muted">
                    {formatFileSize(doc.size)}
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => onRemove(doc.filename)}
                  aria-label={`Remove ${doc.filename}`}
                  className="rounded-md p-1 text-text-muted opacity-0 transition-opacity hover:text-accent-gold group-hover:opacity-100"
                >
                  <Trash2 size={13} />
                </button>
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

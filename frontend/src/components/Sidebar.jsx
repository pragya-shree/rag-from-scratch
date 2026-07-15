import { BookOpenText, RotateCcw } from "lucide-react";
import UploadPanel from "./UploadPanel";

/**
 * Fixed-width left panel: brand, document management, and session
 * reset. Documents state is owned by the parent (via useDocuments) and
 * passed down — this component is purely presentational plumbing.
 */
export default function Sidebar({
  documents,
  isUploading,
  onUpload,
  onRemove,
  onClearSession,
}) {
  return (
    <aside className="flex h-full w-72 shrink-0 flex-col border-r border-border-800 bg-ink-900">
      {/* Brand */}
      <div className="flex items-center gap-2.5 px-5 py-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent-gold-soft">
          <BookOpenText size={18} className="text-accent-gold" strokeWidth={2} />
        </div>
        <div>
          <h1 className="font-display text-lg leading-none text-text-primary">
            Marginalia
          </h1>
          <p className="text-[11px] text-text-muted">Document Q&amp;A</p>
        </div>
      </div>

      <div className="h-px bg-border-800" />

      {/* Documents */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        <UploadPanel
          documents={documents}
          isUploading={isUploading}
          onUpload={onUpload}
          onRemove={onRemove}
        />
      </div>

      {/* Session controls */}
      <div className="border-t border-border-800 px-4 py-4">
        <button
          type="button"
          onClick={onClearSession}
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-border-800 px-3 py-2.5 text-sm text-text-secondary transition-colors hover:border-accent-gold/40 hover:text-text-primary"
        >
          <RotateCcw size={14} />
          Clear session
        </button>
      </div>
    </aside>
  );
}

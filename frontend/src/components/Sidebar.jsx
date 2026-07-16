import { useState } from "react";
import { Sparkles, Circle, Menu, RotateCcw, X } from "lucide-react";
import UploadPanel from "./UploadPanel";

/**
 * Left panel: brand, document management, backend status, and session
 * reset. Fixed-width glass column on desktop; below `lg` it collapses
 * into a slide-out drawer opened via a menu button.
 */
export default function Sidebar({
  documents,
  isLoadingDocuments,
  isUploading,
  uploadProgress,
  deletingFilename,
  onUpload,
  onRemove,
  onClearSession,
  isBackendOnline,
}) {
  const [isOpen, setIsOpen] = useState(false);

  const statusLabel =
    isBackendOnline === null ? "Checking…" : isBackendOnline ? "Backend online" : "Backend offline";
  const statusColor =
    isBackendOnline === null
      ? "fill-text-muted text-text-muted"
      : isBackendOnline
        ? "fill-accent-cyan text-accent-cyan animate-glow-pulse"
        : "fill-accent-pink text-accent-pink";

  const content = (
    <>
      {/* Brand */}
      <div className="flex items-center gap-3 px-5 py-6">
        <div className="glow-purple flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-accent-purple to-accent-cyan">
          <Sparkles size={18} className="text-white" strokeWidth={2} />
        </div>
        <div>
          <h1 className="font-display text-lg font-semibold leading-none text-text-primary">
            Marginalia
          </h1>
          <p className="mt-1 text-[11px] tracking-wide text-text-muted">AI Document Workspace</p>
        </div>
        <button
          type="button"
          onClick={() => setIsOpen(false)}
          aria-label="Close sidebar"
          className="ml-auto rounded-lg p-1.5 text-text-muted hover:text-text-primary lg:hidden"
        >
          <X size={18} />
        </button>
      </div>

      <div className="mx-5 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      {/* Documents */}
      <div className="flex-1 overflow-y-auto px-4 py-5">
        <div className="mb-3 flex items-center justify-between px-0.5">
          <p className="text-xs font-medium uppercase tracking-wide text-text-muted">
            Documents
          </p>
          {documents.length > 0 && (
            <span className="rounded-full bg-gradient-to-r from-accent-purple/30 to-accent-cyan/30 px-2 py-0.5 font-mono text-[10px] text-text-primary">
              {documents.length}
            </span>
          )}
        </div>
        <UploadPanel
          documents={documents}
          isLoading={isLoadingDocuments}
          isUploading={isUploading}
          uploadProgress={uploadProgress}
          deletingFilename={deletingFilename}
          onUpload={onUpload}
          onRemove={onRemove}
        />
      </div>

      {/* Status + session controls */}
      <div className="space-y-3 border-t border-white/10 px-4 py-4">
        <div className="flex items-center gap-2 px-0.5 text-xs text-text-secondary">
          <Circle size={7} className={statusColor} />
          {statusLabel}
        </div>

        <button
          type="button"
          onClick={onClearSession}
          className="group flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.02] px-3 py-2.5 text-sm text-text-secondary transition-all duration-200 hover:border-accent-purple/40 hover:bg-accent-purple/[0.08] hover:text-text-primary"
        >
          <RotateCcw size={14} className="transition-transform duration-300 group-hover:-rotate-45" />
          Clear conversation
        </button>
      </div>
    </>
  );

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        aria-label="Open sidebar"
        className="glass-panel fixed left-4 top-4 z-30 flex h-9 w-9 items-center justify-center rounded-xl text-text-secondary lg:hidden"
      >
        <Menu size={16} />
      </button>

      <aside className="glass-panel hidden h-full w-72 shrink-0 flex-col border-y-0 border-l-0 lg:flex">
        {content}
      </aside>

      {isOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />
          <aside className="glass-panel relative flex h-full w-72 max-w-[85vw] flex-col border-y-0 border-l-0 shadow-2xl">
            {content}
          </aside>
        </div>
      )}
    </>
  );
}

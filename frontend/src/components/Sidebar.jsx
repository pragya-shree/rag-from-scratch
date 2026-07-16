import { useState } from "react";
import { BookOpenText, Circle, Menu, RotateCcw, X } from "lucide-react";
import UploadPanel from "./UploadPanel";

/**
 * Left panel: brand, document management, backend status, and session
 * reset. Fixed-width on desktop; below the `lg` breakpoint it collapses
 * into a slide-out drawer opened via a menu button (rendered by the
 * caller is unnecessary — this component owns its own open/close state
 * since no other component needs to know about it).
 */
export default function Sidebar({
  documents,
  isLoadingDocuments,
  isUploading,
  uploadProgress,
  onUpload,
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
        ? "fill-emerald-400 text-emerald-400"
        : "fill-red-400 text-red-400";

  const content = (
    <>
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
        <button
          type="button"
          onClick={() => setIsOpen(false)}
          aria-label="Close sidebar"
          className="ml-auto rounded-lg p-1.5 text-text-muted hover:text-text-primary lg:hidden"
        >
          <X size={18} />
        </button>
      </div>

      <div className="h-px bg-border-800" />

      {/* Documents */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        <UploadPanel
          documents={documents}
          isLoading={isLoadingDocuments}
          isUploading={isUploading}
          uploadProgress={uploadProgress}
          onUpload={onUpload}
        />
      </div>

      {/* Status + session controls */}
      <div className="space-y-3 border-t border-border-800 px-4 py-4">
        <div className="flex items-center gap-2 px-0.5 text-xs text-text-secondary">
          <Circle size={7} className={statusColor} />
          {statusLabel}
        </div>

        <button
          type="button"
          onClick={onClearSession}
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-border-800 px-3 py-2.5 text-sm text-text-secondary transition-colors hover:border-accent-gold/40 hover:text-text-primary"
        >
          <RotateCcw size={14} />
          Clear conversation
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile menu trigger, shown only when the drawer is closed */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        aria-label="Open sidebar"
        className="fixed left-4 top-4 z-30 flex h-9 w-9 items-center justify-center rounded-lg border border-border-800 bg-surface-800 text-text-secondary lg:hidden"
      >
        <Menu size={16} />
      </button>

      {/* Desktop: static column */}
      <aside className="hidden h-full w-72 shrink-0 flex-col border-r border-border-800 bg-ink-900 lg:flex">
        {content}
      </aside>

      {/* Mobile: slide-out drawer + backdrop */}
      {isOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />
          <aside className="relative flex h-full w-72 max-w-[85vw] flex-col bg-ink-900 shadow-2xl">
            {content}
          </aside>
        </div>
      )}
    </>
  );
}

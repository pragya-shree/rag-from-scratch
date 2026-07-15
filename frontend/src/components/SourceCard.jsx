import { useState } from "react";
import { ChevronDown, FileText } from "lucide-react";
import { formatPageLabel } from "../utils/formatters";

/**
 * A single citation, styled as a "highlighter tab": a compact pill that
 * expands to reveal the retrieved excerpt with an amber highlight wash,
 * and the page number stamped in mono type. This is the app's signature
 * visual element — citations should feel like annotated margin notes,
 * not chat-app footnotes.
 */
export default function SourceCard({ filename, pages, excerpt }) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="overflow-hidden rounded-xl border border-border-800 bg-surface-800/60">
      <button
        type="button"
        onClick={() => setIsExpanded((prev) => !prev)}
        className="flex w-full items-center justify-between gap-3 px-3.5 py-2.5 text-left transition-colors hover:bg-surface-700"
        aria-expanded={isExpanded}
      >
        <span className="flex min-w-0 items-center gap-2">
          <FileText size={14} className="shrink-0 text-accent-gold" strokeWidth={2} />
          <span className="truncate text-sm text-text-primary">{filename}</span>
          <span className="shrink-0 font-mono text-[11px] text-text-muted">
            {formatPageLabel(pages)}
          </span>
        </span>
        <ChevronDown
          size={15}
          className={`shrink-0 text-text-muted transition-transform duration-200 ${
            isExpanded ? "rotate-180" : ""
          }`}
        />
      </button>

      {isExpanded && (
        <div className="border-t border-border-800 px-3.5 py-3">
          <p className="rounded-lg bg-accent-gold-soft px-3 py-2 text-sm leading-relaxed text-text-secondary">
            {excerpt || "Excerpt not available."}
          </p>
        </div>
      )}
    </div>
  );
}

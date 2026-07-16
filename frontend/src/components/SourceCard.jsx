import { useState } from "react";
import { ChevronDown, FileText } from "lucide-react";
import { formatPageLabel } from "../utils/formatters";

/**
 * A single citation, styled as a glass "evidence tab". The real backend
 * (GET /chat, /chat/stream) returns only { filename, pages } per
 * source — no excerpt text — so the expanded state is honest about
 * that rather than fabricating a quote.
 */
export default function SourceCard({ filename, pages }) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="glass-card overflow-hidden rounded-xl transition-all duration-200 hover:-translate-y-0.5 hover:border-accent-purple/30">
      <button
        type="button"
        onClick={() => setIsExpanded((prev) => !prev)}
        className="flex w-full items-center justify-between gap-3 px-3.5 py-2.5 text-left transition-colors hover:bg-white/[0.04]"
        aria-expanded={isExpanded}
      >
        <span className="flex min-w-0 items-center gap-2.5">
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-accent-purple/25 to-accent-cyan/25">
            <FileText size={12} className="text-accent-lavender" strokeWidth={2} />
          </span>
          <span className="truncate text-sm text-text-primary">{filename}</span>
          <span className="shrink-0 rounded-full bg-white/[0.06] px-2 py-0.5 font-mono text-[10px] text-accent-cyan">
            {formatPageLabel(pages)}
          </span>
        </span>
        <ChevronDown
          size={15}
          className={`shrink-0 text-text-muted transition-transform duration-200 ${
            isExpanded ? "rotate-180 text-accent-cyan" : ""
          }`}
        />
      </button>

      {isExpanded && (
        <div className="animate-fade-in border-t border-white/10 px-3.5 py-3">
          <p className="rounded-lg bg-gradient-to-br from-accent-purple/[0.08] to-accent-cyan/[0.08] px-3 py-2 text-xs italic leading-relaxed text-text-secondary">
            The API returns the filename and page number for this citation,
            but not the excerpt text itself — open {filename} at{" "}
            {formatPageLabel(pages)} to read the source passage.
          </p>
        </div>
      )}
    </div>
  );
}

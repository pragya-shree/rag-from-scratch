import { Circle } from "lucide-react";

/**
 * Thin glass header above the conversation area. Shows how many
 * documents are loaded so the user always knows what the assistant
 * can currently answer from.
 */
export default function Header({ documentCount }) {
  const hasDocuments = documentCount > 0;

  return (
    <header className="glass-panel flex h-16 shrink-0 items-center justify-between border-x-0 border-t-0 px-6">
      <div>
        <h1 className="font-display text-base font-semibold text-text-primary">Conversation</h1>
        <p className="text-xs text-text-muted">
          Answers are grounded only in the documents you've uploaded.
        </p>
      </div>

      <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs text-text-secondary">
        <Circle
          size={7}
          className={
            hasDocuments
              ? "fill-accent-cyan text-accent-cyan animate-glow-pulse"
              : "fill-text-muted text-text-muted"
          }
        />
        {hasDocuments
          ? `${documentCount} document${documentCount === 1 ? "" : "s"} loaded`
          : "No documents loaded"}
      </div>
    </header>
  );
}

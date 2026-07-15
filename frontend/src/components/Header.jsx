import { Circle } from "lucide-react";

/**
 * Thin header above the conversation area. Shows how many documents are
 * loaded into the current session so the user always knows what the
 * assistant can currently answer from.
 */
export default function Header({ documentCount }) {
  const hasDocuments = documentCount > 0;

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-border-800 px-6">
      <div>
        <h1 className="font-display text-base text-text-primary">Conversation</h1>
        <p className="text-xs text-text-muted">
          Answers are grounded only in the documents you've uploaded.
        </p>
      </div>

      <div className="flex items-center gap-2 rounded-full border border-border-800 bg-surface-800 px-3 py-1.5 text-xs text-text-secondary">
        <Circle
          size={7}
          className={hasDocuments ? "fill-accent-gold text-accent-gold" : "fill-text-muted text-text-muted"}
        />
        {hasDocuments
          ? `${documentCount} document${documentCount === 1 ? "" : "s"} loaded`
          : "No documents loaded"}
      </div>
    </header>
  );
}

import ReactMarkdown from "react-markdown";
import { AlertTriangle } from "lucide-react";
import SourceCard from "./SourceCard";
import LoadingSpinner from "./LoadingSpinner";

/**
 * Renders one turn of the conversation. Not a chat bubble: the user's
 * question is plain right-aligned text with a thin amber rule; the
 * assistant's answer is a quiet card with markdown content and, when
 * present, a row of source citations beneath it.
 */
export default function ChatMessage({ message }) {
  if (message.role === "user") {
    return (
      <div className="flex justify-end px-6">
        <div className="max-w-xl border-b-2 border-accent-gold/60 pb-2 text-right">
          <p className="text-[15px] leading-relaxed text-text-primary">
            {message.content}
          </p>
        </div>
      </div>
    );
  }

  const isWaitingForFirstToken = !message.content && message.isStreaming;

  return (
    <div className="px-6">
      <div className="max-w-2xl space-y-3">
        <div className="rounded-2xl border border-border-800 bg-surface-800 px-5 py-4 shadow-lg shadow-black/10">
          {isWaitingForFirstToken ? (
            <div className="flex items-center gap-2 text-sm text-text-muted">
              <LoadingSpinner size={14} />
              Reading the documents…
            </div>
          ) : (
            <div className="prose prose-invert prose-sm max-w-none prose-p:leading-relaxed prose-p:text-text-primary prose-headings:font-display prose-strong:text-text-primary prose-a:text-accent-teal">
              <ReactMarkdown>{message.content}</ReactMarkdown>
              {message.isStreaming && (
                <span className="ml-0.5 inline-block h-4 w-1.5 animate-pulse bg-accent-gold align-middle" />
              )}
            </div>
          )}

          {message.wasInterrupted && (
            <div className="mt-3 flex items-center gap-2 border-t border-border-800 pt-3 text-xs text-amber-400">
              <AlertTriangle size={13} className="shrink-0" />
              This response was interrupted. Try asking again.
            </div>
          )}
        </div>

        {message.sources?.length > 0 && (
          <div className="space-y-1.5">
            {message.sources.map((source) => (
              <SourceCard
                key={`${source.filename}-${source.pages.join("-")}`}
                filename={source.filename}
                pages={source.pages}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

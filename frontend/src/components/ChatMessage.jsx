import ReactMarkdown from "react-markdown";
import { AlertTriangle, Sparkles } from "lucide-react";
import SourceCard from "./SourceCard";
import LoadingSpinner from "./LoadingSpinner";

/**
 * Renders one turn of the conversation. Not a chat bubble: the user's
 * question is a soft right-aligned gradient pill; the assistant's
 * answer is a glass card with an AI avatar, markdown content, and,
 * when present, a row of source citations beneath it.
 */
export default function ChatMessage({ message }) {
  if (message.role === "user") {
    return (
      <div className="animate-fade-in-up flex justify-end px-6">
        <div className="max-w-xl rounded-2xl rounded-tr-md bg-gradient-to-br from-accent-purple/20 to-accent-cyan/10 px-4 py-3 text-right">
          <p className="text-[15px] leading-relaxed text-text-primary">
            {message.content}
          </p>
        </div>
      </div>
    );
  }

  const isWaitingForFirstToken = !message.content && message.isStreaming;

  return (
    <div className="animate-fade-in-up flex gap-3 px-6">
      <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-accent-purple to-accent-cyan">
        <Sparkles size={14} className="text-white" strokeWidth={2} />
      </div>

      <div className="max-w-2xl min-w-0 flex-1 space-y-3">
        <div className="glass-card rounded-2xl rounded-tl-md px-5 py-4">
          {isWaitingForFirstToken ? (
            <div className="flex items-center gap-3 text-sm text-text-muted">
              <span className="flex gap-1">
                <span className="animate-shimmer h-3 w-1 rounded-full bg-accent-cyan [animation-delay:-0.3s]" />
                <span className="animate-shimmer h-3 w-1 rounded-full bg-accent-purple [animation-delay:-0.15s]" />
                <span className="animate-shimmer h-3 w-1 rounded-full bg-accent-pink" />
              </span>
              Reading the documents…
            </div>
          ) : (
            <div
              className="prose prose-invert prose-sm max-w-none
                prose-p:leading-relaxed prose-p:text-text-primary
                prose-headings:font-display prose-headings:text-text-primary
                prose-strong:text-text-primary
                prose-a:text-accent-cyan prose-a:no-underline hover:prose-a:underline
                prose-code:rounded-md prose-code:bg-white/[0.08] prose-code:px-1.5 prose-code:py-0.5 prose-code:text-accent-lavender prose-code:before:content-none prose-code:after:content-none
                prose-pre:rounded-xl prose-pre:border prose-pre:border-white/10 prose-pre:bg-black/30
                prose-li:text-text-primary prose-blockquote:border-accent-purple/50 prose-blockquote:text-text-secondary"
            >
              <ReactMarkdown>{message.content}</ReactMarkdown>
              {message.isStreaming && (
                <span className="animate-glow-pulse ml-0.5 inline-block h-4 w-1.5 rounded-full bg-accent-cyan align-middle" />
              )}
            </div>
          )}

          {message.wasInterrupted && (
            <div className="mt-3 flex items-center gap-2 border-t border-white/10 pt-3 text-xs text-accent-pink">
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

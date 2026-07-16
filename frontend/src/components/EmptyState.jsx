import { Sparkles, Upload, Quote } from "lucide-react";

const EXAMPLE_QUESTIONS = [
  "Summarize the key points of this document",
  "What are the main conclusions?",
  "Are there any numbers or statistics mentioned?",
];

/**
 * Landing state shown before the first question is asked. Clicking an
 * example question sends it immediately via onExampleClick (wired to
 * the same sendMessage the chat input uses) rather than just filling
 * the input box — one fewer step for a first-time user.
 */
export default function EmptyState({ hasDocuments, onExampleClick }) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-7 px-6 text-center">
      {/* Animated glowing orb */}
      <div className="relative flex h-20 w-20 items-center justify-center">
        <div className="animate-glow-pulse absolute inset-0 rounded-full bg-gradient-to-br from-accent-purple to-accent-cyan blur-xl" />
        <div className="glass-panel relative flex h-16 w-16 items-center justify-center rounded-2xl">
          <Sparkles size={28} className="text-accent-lavender" strokeWidth={1.75} />
        </div>
      </div>

      <div className="max-w-md space-y-2">
        <h2 className="font-display text-2xl font-semibold text-text-primary">
          {hasDocuments ? (
            "Ask something about your documents"
          ) : (
            <>
              Your <span className="gradient-text">AI document</span> workspace
            </>
          )}
        </h2>
        <p className="text-sm leading-relaxed text-text-secondary">
          {hasDocuments
            ? "Every answer is grounded in your uploaded PDFs, with citations back to the exact source pages."
            : "Upload a PDF, ask anything about it, and get answers with citations back to the exact pages."}
        </p>
      </div>

      {!hasDocuments && (
        <div className="glass-card flex items-center gap-2 rounded-full px-4 py-2 text-xs text-text-secondary">
          <Upload size={13} className="text-accent-cyan" />
          Use the upload panel in the sidebar to get started
        </div>
      )}

      {hasDocuments && (
        <div className="flex w-full max-w-md flex-col gap-2">
          <p className="flex items-center justify-center gap-1.5 text-xs text-text-muted">
            <Quote size={12} />
            Try asking
          </p>
          {EXAMPLE_QUESTIONS.map((question) => (
            <button
              key={question}
              type="button"
              onClick={() => onExampleClick?.(question)}
              className="glass-card animate-fade-in-up rounded-xl px-4 py-2.5 text-left text-sm text-text-secondary transition-all duration-200 hover:-translate-y-0.5 hover:border-accent-purple/30 hover:text-text-primary"
            >
              {question}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

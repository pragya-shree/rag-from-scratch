import { BookOpenText } from "lucide-react";

/**
 * Shown in the conversation area before the first question is asked.
 * Doubles as a nudge to upload a document if none exist yet.
 */
export default function EmptyState({ hasDocuments }) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 px-6 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-border-800 bg-surface-800">
        <BookOpenText size={26} className="text-accent-gold" strokeWidth={1.75} />
      </div>

      <div className="max-w-sm space-y-1.5">
        <h2 className="font-display text-xl text-text-primary">
          {hasDocuments ? "Ask something about your documents" : "Start by adding a document"}
        </h2>
        <p className="text-sm leading-relaxed text-text-secondary">
          {hasDocuments
            ? "Every answer is grounded in your uploaded PDFs, with the exact pages cited below."
            : "Upload a PDF from the sidebar to begin. Marginalia reads it, then answers questions with citations back to the source pages."}
        </p>
      </div>
    </div>
  );
}

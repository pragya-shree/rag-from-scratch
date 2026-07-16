import { BookOpenText, Upload, MessageCircleQuestion, Quote } from "lucide-react";

/**
 * Shown before the first question is asked. Walks through the app's
 * three-step flow as required: upload, ask, get cited answers.
 */
export default function EmptyState({ hasDocuments }) {
  const steps = [
    { icon: Upload, text: "Upload one or more PDFs from the sidebar." },
    { icon: MessageCircleQuestion, text: "Ask a question about their contents." },
    { icon: Quote, text: "Get an answer with citations back to the exact pages." },
  ];

  return (
    <div className="flex h-full flex-col items-center justify-center gap-6 px-6 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-border-800 bg-surface-800">
        <BookOpenText size={26} className="text-accent-gold" strokeWidth={1.75} />
      </div>

      <div className="max-w-sm space-y-1.5">
        <h2 className="font-display text-xl text-text-primary">
          {hasDocuments ? "Ask something about your documents" : "Start by adding a document"}
        </h2>
        <p className="text-sm leading-relaxed text-text-secondary">
          Every answer is grounded in your uploaded PDFs, with citations
          back to the exact source pages.
        </p>
      </div>

      <ol className="flex w-full max-w-sm flex-col gap-2.5 text-left">
        {steps.map(({ icon: Icon, text }, i) => (
          <li
            key={i}
            className="flex items-center gap-3 rounded-xl border border-border-800 bg-surface-800/50 px-3.5 py-2.5"
          >
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-accent-gold-soft font-mono text-[11px] text-accent-gold">
              {i + 1}
            </span>
            <Icon size={15} className="shrink-0 text-text-muted" />
            <span className="text-sm text-text-secondary">{text}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}

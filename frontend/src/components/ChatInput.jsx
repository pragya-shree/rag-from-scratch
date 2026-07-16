import { useRef, useState } from "react";
import { ArrowUp, Square } from "lucide-react";

/**
 * Bottom-pinned chat input. Grows with content up to a max height,
 * submits on Enter (Shift+Enter for a newline), and swaps its action
 * button to a stop control while a response is streaming.
 */
export default function ChatInput({ onSend, isStreaming, onStop, disabled }) {
  const [value, setValue] = useState("");
  const textareaRef = useRef(null);

  const handleInput = (e) => {
    setValue(e.target.value);
    const el = textareaRef.current;
    if (el) {
      el.style.height = "auto";
      el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
    }
  };

  const submit = () => {
    if (!value.trim() || isStreaming) return;
    onSend(value);
    setValue("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  };

  return (
    <div className="px-6 py-4">
      <div className="glass-panel mx-auto flex max-w-3xl items-end gap-2 rounded-2xl px-3 py-2.5 transition-all duration-200 focus-within:border-accent-purple/50 focus-within:glow-purple">
        <textarea
          ref={textareaRef}
          rows={1}
          value={value}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          placeholder={
            disabled
              ? "Upload a document to start asking questions…"
              : "Ask a question about your documents…"
          }
          className="max-h-40 flex-1 resize-none bg-transparent px-1.5 py-1.5 text-sm text-text-primary placeholder:text-text-muted focus:outline-none disabled:cursor-not-allowed"
        />

        {isStreaming ? (
          <button
            type="button"
            onClick={onStop}
            aria-label="Stop generating"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.06] text-text-secondary transition-colors hover:text-text-primary"
          >
            <Square size={13} className="fill-current" />
          </button>
        ) : (
          <button
            type="button"
            onClick={submit}
            disabled={disabled || !value.trim()}
            aria-label="Send question"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-accent-purple to-accent-cyan text-white shadow-lg shadow-accent-purple/30 transition-all duration-200 hover:scale-105 hover:shadow-accent-purple/50 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:scale-100"
          >
            <ArrowUp size={16} strokeWidth={2.5} />
          </button>
        )}
      </div>
    </div>
  );
}

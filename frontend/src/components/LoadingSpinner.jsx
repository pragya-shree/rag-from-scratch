import { Loader2 } from "lucide-react";

/**
 * Small inline spinner. Size is controlled via className so callers can
 * drop it into a button, a full-page state, or inline text.
 */
export default function LoadingSpinner({ size = 16, className = "" }) {
  return (
    <Loader2
      size={size}
      className={`animate-spin text-accent-cyan ${className}`}
      aria-hidden="true"
    />
  );
}

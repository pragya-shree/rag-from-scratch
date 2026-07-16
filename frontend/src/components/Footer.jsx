import { Cpu, Layers } from "lucide-react";

/**
 * Slim glass footer showing the active backend configuration, from
 * GET /info. Purely informational.
 */
export default function Footer({ info }) {
  if (!info) return null;

  const retrievalMode = info.rerank
    ? "Hybrid + Reranking"
    : info.hybrid_search
      ? "Hybrid (FAISS + BM25)"
      : "Semantic (FAISS)";

  return (
    <footer className="glass-panel flex shrink-0 flex-wrap items-center gap-x-5 gap-y-1.5 border-x-0 border-b-0 px-6 py-2.5 text-[11px] text-text-muted">
      <span className="flex items-center gap-1.5">
        <Cpu size={12} className="text-accent-lavender" />
        Model: <span className="font-mono text-text-secondary">{info.ollama_model}</span>
      </span>
      <span className="flex items-center gap-1.5">
        <Layers size={12} className="text-accent-cyan" />
        Embeddings: <span className="font-mono text-text-secondary">{info.embedding_model}</span>
      </span>
      <span className="ml-auto rounded-full bg-gradient-to-r from-accent-purple/20 to-accent-cyan/20 px-2.5 py-0.5 text-text-secondary">
        {retrievalMode}
      </span>
    </footer>
  );
}

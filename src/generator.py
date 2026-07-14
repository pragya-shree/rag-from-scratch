"""Step 6 of the pipeline: send retrieved context + question to the LLM.

Generation runs locally through Ollama. Two entry points are provided:

- generate_answer()        : blocking call, returns the full answer text.
- generate_answer_stream() : generator, yields the answer as it's produced.
                              Falls back to generate_answer() (yielded as
                              one chunk) if streaming can't be started.

The prompt intentionally does NOT ask the model to cite sources inline —
citations are computed separately from chunk metadata and shown in a
"Sources" section after the answer, so the generated text stays clean.

Both entry points accept an optional `history` — a list of recent
(question, answer) tuples — which is folded into the prompt so the model
has short-term conversational context.
"""

import logging
import ollama
from src.config import OLLAMA_MODEL

logger = logging.getLogger(__name__)

PROMPT_TEMPLATE = """You are a precise assistant answering questions using
excerpts from one or more documents. Use ONLY the context below. Do not
use outside knowledge and do not guess. Information may come from
different source files — combine it when relevant. If the answer is not
contained in the context, reply exactly:
"I don't know based on the provided documents."

{history_block}Context:
{context}

Question: {question}

Answer:"""


def format_history(history):
    """Turn a list of (question, answer) tuples into a prompt-ready block.
    Returns "" when there's no history, so the prompt layout is unaffected.
    """
    if not history:
        return ""
    exchanges = "\n\n".join(f"Q: {q}\nA: {a}" for q, a in history)
    return f"Previous conversation:\n{exchanges}\n\n"


def build_prompt(question, chunks, history=None):
    context = "\n\n".join(
        f"[{c['filename']}, page {c['page']}] {c['text']}" for c in chunks
    )
    history_block = format_history(history)
    return PROMPT_TEMPLATE.format(
        context=context, question=question, history_block=history_block
    )


def format_sources(chunks):
    """Return deduplicated sources grouped by document:
    [(filename, [page, page, ...]), ...], sorted by filename then page.
    """
    pages_by_file = {}
    for c in chunks:
        pages_by_file.setdefault(c["filename"], set()).add(c["page"])

    return [
        (filename, sorted(pages))
        for filename, pages in sorted(pages_by_file.items())
    ]


def generate_answer(question, chunks, history=None):
    """Blocking call: returns the full generated answer as a string."""
    prompt = build_prompt(question, chunks, history=history)
    logger.info("Generating answer via Ollama (model=%s)", OLLAMA_MODEL)
    response = ollama.generate(model=OLLAMA_MODEL, prompt=prompt, stream=False)
    return response.get("response", "").strip()


def generate_answer_stream(question, chunks, history=None):
    """Generator: yields the answer text in chunks as Ollama streams it.

    If the stream fails before producing any output (e.g. streaming is
    unsupported by the running Ollama version, or the initial connection
    fails), falls back to a single non-streaming call and yields the
    whole answer as one chunk. A failure *after* partial output has
    already been yielded is re-raised rather than silently retried,
    since re-generating would duplicate text the user already saw.
    """
    prompt = build_prompt(question, chunks, history=history)
    received_any = False
    try:
        logger.info("Generating answer via Ollama (streaming, model=%s)", OLLAMA_MODEL)
        for part in ollama.generate(model=OLLAMA_MODEL, prompt=prompt, stream=True):
            token = part.get("response", "")
            if token:
                received_any = True
                yield token
    except Exception as e:
        if received_any:
            logger.error("Streaming interrupted after partial output: %s", e)
            raise
        logger.warning("Streaming unavailable (%s); falling back to non-streaming", e)
        yield generate_answer(question, chunks, history=history)
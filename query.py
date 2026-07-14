"""Entry point: ask questions -> retrieve across all PDFs -> Ollama answer.

Run after ingest.py has been run once:
    python query.py

Keeps conversation memory for the current session. Type 'exit' or
'quit' to end. Whether responses stream token-by-token or print as a
single block is controlled by STREAMING in src/config.py. A performance
summary is printed after each query when SHOW_METRICS is enabled.
"""

import logging
from dotenv import load_dotenv
from src.logging_setup import setup_logging
from src.pipeline import answer_question, answer_question_stream
from src.generator import format_sources
from src.memory import ConversationMemory
from src.metrics import timer, reset as reset_metrics, get_metrics, format_duration
from src.config import STREAMING, SHOW_METRICS

load_dotenv()
setup_logging()
logger = logging.getLogger(__name__)


def print_retrieved(chunks):
    print("\n--- Retrieved context ---")
    for c in chunks:
        preview = c["text"].strip().splitlines()[0][:120]
        print(
            f"chunk_id={c['id']} | file={c['filename']} | "
            f"page={c['page']} | score={c['score']:.4f}"
        )
        print(f"  {preview}...")
    print("--------------------------\n")


def print_sources(chunks):
    print("Sources:")
    for filename, pages in format_sources(chunks):
        label = "page" if len(pages) == 1 else "pages"
        page_list = ", ".join(str(p) for p in pages)
        print(f"- {filename} ({label} {page_list})")


STAGE_LABELS = [
    ("loading", "Loading"),
    ("retrieval", "Retrieval"),
    ("reranking", "Reranking"),
    ("generation", "Generation"),
    ("total", "Total Query"),
]


def print_metrics(metrics):
    """Print a clean summary of stage durations. A stage that didn't
    run (e.g. reranking when disabled) is simply absent from `metrics`
    and is skipped rather than shown as zero.
    """
    if not SHOW_METRICS or not metrics:
        return

    print("Performance Metrics")
    print("-------------------")
    for key, label in STAGE_LABELS:
        if key in metrics:
            print(f"{label:<11}: {format_duration(metrics[key])}")
    print()


def _get_answer(question, history):
    """Return (retrieved_chunks, answer_text).

    If STREAMING is enabled, prints tokens to stdout as they arrive.
    Otherwise makes a single blocking call and prints the full answer.
    """
    reset_metrics()

    with timer("total"):
        if STREAMING:
            retrieved, answer_stream = answer_question_stream(question, history=history)
            print_retrieved(retrieved)
            print("Answer:")
            pieces = []
            with timer("generation") as t:
                for piece in answer_stream:
                    print(piece, end="", flush=True)
                    pieces.append(piece)
            logger.info("Stage 'generation' completed in %s", format_duration(t.elapsed))
            answer = "".join(pieces)
            print("\n")
        else:
            retrieved, answer = answer_question(question, history=history)
            print_retrieved(retrieved)
            print("Answer:")
            print(answer)
            print()

    return retrieved, answer


def main():
    memory = ConversationMemory()
    print("RAG assistant ready. Type 'exit' or 'quit' to end the session.\n")

    while True:
        question = input("Ask a question: ").strip()
        if question.lower() in {"exit", "quit"}:
            break
        if not question:
            continue

        retrieved, answer = _get_answer(question, memory.get_recent())

        print_sources(retrieved)
        print()
        print_metrics(get_metrics())

        memory.add(question, answer)


if __name__ == "__main__":
    main()
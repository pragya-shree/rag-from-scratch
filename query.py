# """Entry point: question -> retrieval -> Gemini -> answer.

# Run after ingest.py has been run once:
#     python query.py
# """

# import logging
# from dotenv import load_dotenv
# from src.logging_setup import setup_logging
# from src.vector_store import load
# from src.retriever import retrieve
# #from src.llm import ask

# load_dotenv()
# setup_logging()
# logger = logging.getLogger(__name__)


# def print_retrieved(chunks):
#     print("\n--- Retrieved context ---")
#     for c in chunks:
#         preview = c["text"].strip().splitlines()[0][:120]
#         print(f"chunk_id={c['id']} | page={c['page']} | score={c['score']:.4f}")
#         print(f"  {preview}...")
#     print("--------------------------\n")


# def main():
#     index, chunks = load()
#     question = input("Ask a question: ")

#     results = retrieve(question, index, chunks)
#     print_retrieved(results)

#     # answer = ask(question, results)
#     # print("Answer:")
#     # print(answer)


# if __name__ == "__main__":
#     main()


"""Entry point: ask a question -> retrieve across all PDFs -> Gemini answer.

Run after ingest.py has been run once:
    python query.py
"""

import logging
from dotenv import load_dotenv
from src.logging_setup import setup_logging
from src.pipeline import answer_question

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


def main():
    question = input("Ask a question: ")
    retrieved, answer = answer_question(question)

    print_retrieved(retrieved)

    print("Answer:")
    print(answer)


if __name__ == "__main__":
    main()
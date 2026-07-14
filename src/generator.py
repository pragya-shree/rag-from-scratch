# """Step 6 of the pipeline: send retrieved context + question to Gemini."""

# import os
# import logging
# import google.generativeai as genai
# from dotenv import load_dotenv
# from src.config import GEMINI_MODEL

# logger = logging.getLogger(__name__)

# load_dotenv()

# genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

# PROMPT_TEMPLATE = """You are a precise assistant. Answer the question using
# ONLY the context below. Do not use outside knowledge and do not guess.
# If the answer is not contained in the context, reply exactly:
# "I don't know based on the provided document."

# Context:
# {context}

# Question: {question}

# Answer:"""


# def build_prompt(question, chunks):
#     context = "\n\n".join(f"[Page {c['page']}] {c['text']}" for c in chunks)
#     return PROMPT_TEMPLATE.format(context=context, question=question)


# def ask(question, chunks):
#     prompt = build_prompt(question, chunks)
#     model = genai.GenerativeModel(GEMINI_MODEL)
#     logger.info("Sending prompt to Gemini (%s)", GEMINI_MODEL)
#     response = model.generate_content(prompt)
#     return response.text

# """Step 6 of the pipeline: send retrieved context + question to Gemini.

# Each chunk is labeled with its source filename and page number, so the
# model can synthesize an answer across multiple PDFs and you can trace
# each fact back to its origin.
# """

# import os
# import logging
# import google.generativeai as genai
# from dotenv import load_dotenv
# from src.config import GEMINI_MODEL

# logger = logging.getLogger(__name__)
# load_dotenv()

# genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))

# PROMPT_TEMPLATE = """You are a precise assistant answering questions using
# excerpts from one or more documents. Use ONLY the context below. Do not
# use outside knowledge and do not guess. Information may come from
# different source files — combine it when relevant. If the answer is not
# contained in the context, reply exactly:
# "I don't know based on the provided documents."

# When you use a fact, mention which source it came from, e.g. (source.pdf, page 3).

# Context:
# {context}

# Question: {question}

# Answer:"""


# def build_prompt(question, chunks):
#     context = "\n\n".join(
#         f"[{c['filename']}, page {c['page']}] {c['text']}" for c in chunks
#     )
#     return PROMPT_TEMPLATE.format(context=context, question=question)


# def generate_answer(question, chunks):
#     prompt = build_prompt(question, chunks)
#     model = genai.GenerativeModel(GEMINI_MODEL)
#     logger.info("Sending prompt to Gemini (%s)", GEMINI_MODEL)
#     response = model.generate_content(prompt)
#     return response.text

"""Step 6 of the pipeline: send retrieved context + question to Ollama."""

import logging
import requests

from src.config import OLLAMA_HOST, OLLAMA_MODEL

logger = logging.getLogger(__name__)

OLLAMA_URL = f"{OLLAMA_HOST}/api/generate"

PROMPT_TEMPLATE = """You are a precise assistant answering questions using
excerpts from one or more documents. Use ONLY the context below. Do not
use outside knowledge and do not guess. Information may come from
different source files — combine it when relevant. If the answer is not
contained in the context, reply exactly:
"I don't know based on the provided documents."

When you use a fact, mention which source it came from, e.g. (source.pdf, page 3).

Context:
{context}

Question: {question}

Answer:
"""


def build_prompt(question, chunks):
    context = "\n\n".join(
        f"[{c['filename']}, page {c['page']}] {c['text']}"
        for c in chunks
    )
    return PROMPT_TEMPLATE.format(
        context=context,
        question=question,
    )


def generate_answer(question, chunks):
    prompt = build_prompt(question, chunks)

    logger.info("Sending prompt to Ollama (%s)", OLLAMA_MODEL)

    response = requests.post(
        OLLAMA_URL,
        json={
            "model": OLLAMA_MODEL,
            "prompt": prompt,
            "stream": False,
        },
    )

    response.raise_for_status()

    return response.json()["response"]
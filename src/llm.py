"""Step 6 of the pipeline: send retrieved context + question to Gemini."""

import os
import logging
import google.generativeai as genai
from dotenv import load_dotenv
from src.config import GEMINI_MODEL

logger = logging.getLogger(__name__)

load_dotenv()

genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

PROMPT_TEMPLATE = """You are a precise assistant. Answer the question using
ONLY the context below. Do not use outside knowledge and do not guess.
If the answer is not contained in the context, reply exactly:
"I don't know based on the provided document."

Context:
{context}

Question: {question}

Answer:"""


def build_prompt(question, chunks):
    context = "\n\n".join(f"[Page {c['page']}] {c['text']}" for c in chunks)
    return PROMPT_TEMPLATE.format(context=context, question=question)


def ask(question, chunks):
    prompt = build_prompt(question, chunks)
    model = genai.GenerativeModel(GEMINI_MODEL)
    logger.info("Sending prompt to Gemini (%s)", GEMINI_MODEL)
    response = model.generate_content(prompt)
    return response.text

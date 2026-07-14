# 🚀 RAG From Scratch — Local Document Question Answering System

A complete **Retrieval-Augmented Generation (RAG)** system built from scratch that allows users to ask questions about their documents and receive accurate, context-aware answers using **local LLM inference**.

The project combines semantic search, keyword retrieval, reranking, conversation memory, and local generation to create a production-style RAG pipeline without relying on paid APIs.

---

## ✨ Features

## 📄 Document Processing

- Load and process PDF documents
- Extract text with page-level metadata
- Intelligent text chunking
- Track document source information:
  - File name
  - Page number
  - Chunk ID


---

# 🔍 Advanced Retrieval Pipeline

The system uses a hybrid retrieval architecture combining semantic and keyword search.

## Semantic Retrieval

- Sentence Transformer embeddings
- FAISS vector database
- Similarity-based retrieval


## Keyword Retrieval

- BM25 lexical search
- Exact keyword matching


## Hybrid Retrieval

The system combines:

- FAISS semantic results
- BM25 keyword results

using **Reciprocal Rank Fusion (RRF)**.


## Optional Reranking

- CrossEncoder reranking improves retrieved context relevance.


### Retrieval Flow

```text
User Query
     |
     ↓
Embedding Generation
     |
     ↓
FAISS Vector Search
     |
     +----------------+
                      |
                      ↓
              BM25 Keyword Search
                      |
                      ↓
            Hybrid Retrieval (RRF)
                      |
                      ↓
            CrossEncoder Reranking
                      |
                      ↓
             Relevant Context
```

# 🤖 Local LLM Generation

The project uses:

- **Ollama**
- **llama3.2:3b**

for local answer generation.

Benefits:

- No paid APIs
- No API keys required
- Private document processing
- Fully local inference


Generation supports:

- Streaming responses
- Fallback generation mode
- Context-aware prompting


---

# 🧠 Conversation Memory

The system supports session-based conversation memory.

Example:

User:
What is pollution?

Assistant:
Pollution is the contamination of the environment...

User:
What are its main causes?

Assistant:
The main causes include...


The system can understand follow-up questions using previous conversation context.


---

# 📚 Source Citations

Every generated answer includes document references.

Example:

Sources:
document.pdf (pages 1, 2)

This makes answers traceable back to the original documents.

---

# ⚡ Performance Monitoring

The pipeline records execution time for different stages.

Example:

Performance Metrics

Loading : 45 ms
Retrieval : 5.65 s
Generation : 8.06 s
Total Query: 13.75 s

This helps analyze and optimize system performance.


---

# 🏗️ System Architecture

```text
                 PDF Documents
                       |
                       ↓
          Document Processing
                       |
                       ↓
                  Text Chunks
                       |
          +------------+-------------+
          |                          |
          ↓                          ↓
   Embedding Model              BM25 Index
          |                          |
          ↓                          ↓
        FAISS                 Keyword Search
          |                          |
          +------------+-------------+
                       |
                       ↓
              Hybrid Retrieval (RRF)
                       |
                       ↓
             CrossEncoder Reranker
                       |
                       ↓
             Context Construction
                       |
                       ↓
                  Ollama LLM
                       |
                       ↓
             Answer + Citations
```              

---

# 🛠️ Tech Stack

## Programming

- Python


## Machine Learning / NLP

- Sentence Transformers
- FAISS
- BM25
- CrossEncoder


## LLM

- Ollama
- llama3.2:3b


## Engineering

- Modular pipeline architecture
- Configuration management
- Logging
- Performance monitoring

---

# 📂 Project Structure

```text
rag-from-scratch/
│
├── data/
│   └── your_documents.pdf
│
├── storage/
│   └── vector indexes
│
├── src/
│   ├── loader.py
│   ├── chunker.py
│   ├── embedder.py
│   ├── vectorstore.py
│   ├── retriever.py
│   ├── hybrid_retriever.py
│   ├── keyword_retriever.py
│   ├── reranker.py
│   ├── generator.py
│   ├── memory.py
│   ├── metrics.py
│   ├── config.py
│   └── logging_setup.py
│
├── ingest.py
├── query.py
├── requirements.txt
├── .env.example
└── README.md
```

# ⚙️ Installation

## Clone Repository

```bash
git clone https://github.com/your-username/rag-from-scratch.git

cd rag-from-scratch
```

## Create Virtual Environment

```bash
python -m venv .venv
```

Activate the environment:

### Windows

```bash
.venv\Scripts\activate
```

---

## Install Dependencies

```bash
pip install -r requirements.txt
```

---

# 🦙 Setup Ollama

Install Ollama:

https://ollama.com/

Download the required model:

```bash
ollama pull llama3.2:3b
```

Make sure Ollama is running before querying documents.

---

# 📥 Ingest Documents

Place your PDF files inside:

```
data/
```

Run:

```bash
python ingest.py
```

This creates the searchable document index.

---

# 💬 Ask Questions

Run:

```bash
python query.py
```

Example:

```
Ask a question:
What is pollution?
```

Example output:

```
Answer:
Pollution refers to contamination of the environment...

Sources:
- document.pdf (pages 1, 2)
```

---

# 🔮 Future Improvements

- [ ] Streamlit web interface
- [ ] Document upload UI
- [ ] Persistent chat history
- [ ] Docker support
- [ ] Cloud deployment
- [ ] Support more document formats
- [ ] Retrieval visualization

---

# 📸 Screenshots


# 🤝 Contributing

Contributions and suggestions are welcome.

Feel free to open issues or submit pull requests.

---
# 🚀 RAG From Scratch — Local Document Question Answering System

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

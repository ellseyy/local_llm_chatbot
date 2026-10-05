# Local LLM Chatbot

A minimal full-stack chat application featuring a custom frontend, a Python backend API, and a locally hosted LLM via Ollama.

## Architecture

* **LLM Runtime:** Ollama (`llama3.1:8b`)
* **Backend:** Python / FastAPI / Uvicorn
* **Frontend:** Node.js / Vite / npm

## Prerequisites

* [Ollama](https://ollama.com/) installed locally
* Python 3.x (`venv`)
* Node.js & npm

## Quick Start

Execute the following commands in **three separate terminal windows**:

### 1. Backend
```bash
cd backend
source venv/bin/activate  # or source .venv/bin/activate
uvicorn main:app --reload
```

### 2. Frontend
```bash
cd frontend
npm run dev
```

### 3. Ollama
```bash
ollama run llama3.1:8b
```

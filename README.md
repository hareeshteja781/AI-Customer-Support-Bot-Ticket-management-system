# AI Customer Support Bot - Final Build

A FastAPI + React application for customer support, tickets, conversations, analytics, document ingestion, RAG-style retrieval, and optional Gemini responses.

## Final project structure

```text
chat_bot_ai_final/
|-- backend/
|   |-- app/
|   |   |-- ai/
|   |   |-- api/routes/
|   |   |-- core/
|   |   |-- models/
|   |   |-- schemas/
|   |   |-- services/
|   |   |-- uploads/
|   |   `-- main.py
|   |-- tests/
|   |-- .env.example
|   |-- requirements.txt
|   `-- Dockerfile
|-- frontend/
|   |-- public/
|   |-- src/
|   |-- .env.example
|   |-- package.json
|   |-- package-lock.json
|   `-- vite.config.js
|-- docker-compose.yml
|-- .env.example
|-- run_backend.bat
|-- run_frontend.bat
`-- README.md
```

## Windows setup

### 1. Backend

Open a terminal in `backend`:

```powershell
python -m venv .venv
.\.venv\Scripts\activate
pip install -r requirements.txt
```

Copy `backend/.env.example` to `backend/.env`. The default database is SQLite, so PostgreSQL is not required for the basic local run.

Start the API:

```powershell
uvicorn app.main:app --reload
```

The API runs at `http://localhost:8000` and health check is `http://localhost:8000/health`.

### 2. Frontend

Open a second terminal in `frontend`:

```powershell
npm install
npm run dev
```

Open the URL printed by Vite, normally `http://localhost:5173`.

### 3. Gemini AI

The application starts without a Gemini key. AI chat responses require `GEMINI_API_KEY` in `backend/.env`.

### Seeded demo accounts

```text
Admin    admin@example.com       adm123
Agent    agent@example.com       agt123
Customer customer@example.com    password
```

Change these credentials for any non-demo deployment.

## Verification completed

- Backend Python compilation: passed.
- Backend pytest suite: 14/14 passed.
- Frontend ESLint: 0 errors, 0 warnings.
- Frontend production build was not executed against the bundled archive dependencies because the original archive contained a Windows/incomplete `rolldown` native dependency tree. The final package intentionally excludes `node_modules`; run `npm install` on the target machine before `npm run build`.

## Important deployment note

Do not commit `.env` files, local SQLite databases, `node_modules`, or `dist` to Git. Use the `.env.example` files as templates.

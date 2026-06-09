# E2B Native Tool Agent

## Project Overview
- **Name**: E2B Native Tool Agent
- **Goal**: Production-grade chat-based AI coding agent that uses OpenRouter native tool calling to read, create, and overwrite files inside an E2B sandbox.
- **Architecture**: Separate FastAPI backend and React Vite frontend.

## Completed Features
- Native OpenRouter `tools` integration with exact `file_write` and `file_read` schemas.
- FastAPI backend with async SSE streaming, `asyncio`, `uvicorn`, and Pydantic request validation.
- Automatic E2B sandbox creation before the first chat request, using `Sandbox.create(api_key=..., timeout=..., template=...)` when supported by the official SDK.
- 1-hour sandbox timeout and max iteration limit of 1000, displayed in the UI and reset on every user message.
- Real-time token streaming with tool-call interruption and continuation after tool results.
- Responsive black professional UI built with React, Vite, Radix UI primitives, and Zustand.
- Settings dialog for OpenRouter API key, E2B API key, model selection, and optional custom E2B template id.
- Right-side tree-based sandbox file explorer updated after tool calls.
- Tool activity chips showing `create: FILE_PATH` and `read: FILE_PATH`.
- Frontend backend URL is configured only through `frontend/.env` via `VITE_BACKEND_URL`.

## Functional Entry URIs
Backend:
- `GET /health`
- `POST /api/openrouter/models` body: `{ "api_key": "..." }`
- `POST /api/chat/stream` SSE body: `{ "message", "session_id", "openrouter_api_key", "e2b_api_key", "model", "template_id" }`
- `POST /api/files/tree` body: `{ "session_id": "..." }`

Frontend:
- `/` main chat and file explorer UI.

## Data Architecture
- **Persistent file storage**: E2B sandbox filesystem only.
- **Browser storage**: User settings only through Zustand persistence; generated files are not stored in the browser.
- **Server memory**: Runtime conversation history and active sandbox sessions for the current backend process.

## User Guide
1. Open the application.
2. Click **Settings**.
3. Add an OpenRouter API key and E2B API key.
4. Click **Fetch OpenRouter models** and select a model with tool support.
5. Optionally add an E2B template id.
6. Send a request such as: `Create /home/user/project/README.md with a production project overview.`

## Local Development
Backend:
```bash
cd /home/user/webapp/backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
PYTHONPATH=/home/user/webapp/backend python -m uvicorn src.main:app --host 0.0.0.0 --port 8000
```

Frontend:
```bash
cd /home/user/webapp/frontend
npm install
npm run build
npm run preview
```

## Deployment Status
- **Sandbox preview**: configured to run backend on port 8000 and frontend on port 3000.
- **Tech Stack**: FastAPI, Python, OpenRouter, E2B SDK, React, Vite, Radix UI, Zustand.
- **Last Updated**: 2026-06-09

## Not Yet Implemented
- Multi-provider UI adapter beyond OpenRouter, although the frontend/backend structure allows adding providers.
- Durable server-side session storage across backend restarts.

## Recommended Next Steps
- Add encrypted server-side credential storage if multi-user production hosting is required.
- Add authentication and per-user sandbox/session isolation for public deployment.

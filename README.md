# Agent 2.0 — AI-Powered Coding Agent

A production-grade chat-based AI coding agent that uses OpenRouter native tool calling to read, create, and overwrite files inside an [E2B](https://e2b.dev) sandbox. The backend streams LLM responses via SSE while executing `file_write` and `file_read` tool calls in real time.

## Features

- **Native tool calling** — OpenRouter `tools` integration with exact `file_write` and `file_read` schemas
- **Real-time streaming** — Async SSE streaming with tool-call interruption and continuation after tool results
- **E2B sandbox** — Automatic sandbox creation per session with configurable timeout and template support
- **Live file tree** — Sandbox file explorer updated after every tool call
- **Settings dialog** — API key management, model selection, custom E2B template ID
- **Agent memory** — Slide-out panel showing agent context
- **Responsive UI** — Desktop, tablet, and mobile layouts

## Architecture

```
┌──────────┐     SSE stream     ┌───────────┐     OpenRouter API     ┌────────────┐
│ Frontend │ ◄───────────────── │  Backend  │ ◄──────────────────── │ OpenRouter │
│ React    │ ──────────────────► │  FastAPI  │ ─────────────────────► │  (LLM)     │
│ Vite     │   chat messages     │  Uvicorn  │   tool calls/results  │            │
└──────────┘                     └─────┬─────┘                       └────────────┘
                                       │
                                       │ file operations
                                       ▼
                               ┌──────────────┐
                               │  E2B Sandbox │
                               │  (ephemeral) │
                               └──────────────┘
```

## Quick Start

### Backend

```bash
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
python -m uvicorn src.main:app --host 0.0.0.0 --port 8000
```

### Frontend

```bash
cd frontend
npm install
cp .env.example .env    # set VITE_BACKEND_URL=http://localhost:8000
npm run dev             # http://localhost:3000
```

## Tech Stack

| Layer       | Technology |
|-------------|------------|
| Backend     | Python, FastAPI, Uvicorn, Pydantic, httpx |
| Sandbox     | E2B SDK 1.5 |
| LLM Gateway | OpenRouter (tool-calling models) |
| Frontend    | React 18, TypeScript, Vite 4 |
| Styling     | Tailwind CSS 3 |
| UI          | Radix UI (Dialog, ScrollArea, Select, Separator, Tooltip) |
| State       | Zustand 5 (persist middleware) |

## API Endpoints

| Method | Path                    | Description |
|--------|-------------------------|-------------|
| GET    | `/health`               | Health check |
| POST   | `/api/openrouter/models`| Fetch available models |
| POST   | `/api/chat/stream`      | SSE chat stream |
| POST   | `/api/files/tree`       | Get sandbox file tree |

### Chat Stream Events

The `/api/chat/stream` endpoint emits Server-Sent Events:

| Event Type  | Description |
|-------------|-------------|
| `token`     | Text token from the LLM |
| `tool_call` | Tool invocation (file_read / file_write) |
| `tool_result`| Result of a tool execution |
| `file_tree`  | Updated sandbox file tree |
| `done`       | Stream complete |
| `error`      | Error occurred |

## Environment Variables

### Backend (`backend/.env`)

| Variable              | Default       | Description |
|-----------------------|---------------|-------------|
| `APP_NAME`            | `Agent 2.0`   | Application name |
| `MAX_ITERATIONS`      | `1000`        | Max agent iterations per request |
| `CORS_ALLOW_ORIGINS`  | `["*"]`       | CORS origins |
| `E2B_TEMPLATE_ID`     | —             | Optional E2B sandbox template |

### Frontend (`frontend/.env`)

| Variable              | Default                     | Description |
|-----------------------|-----------------------------|-------------|
| `VITE_BACKEND_URL`    | `http://localhost:8000`      | Backend API URL |

## Usage

1. Open the app in your browser.
2. Click **Settings** (gear icon).
3. Enter your OpenRouter API key and E2B API key.
4. Click **Fetch OpenRouter models** and select a tool-capable model.
5. Optionally enter an E2B template ID.
6. Send a prompt such as:

   ```
   Create /home/user/project/README.md with a production project overview.
   Create a simple Python script that prints "Hello, World!" to /home/user/hello.py.
   ```

## Data Architecture

- **File storage**: E2B sandbox filesystem only (ephemeral, tied to session)
- **Browser storage**: User settings only (Zustand persist → localStorage)
- **Server memory**: Runtime conversation history and active sandbox sessions

## Not Yet Implemented

- Multi-provider UI adapter beyond OpenRouter (backend/frontend structure supports adding more)
- Durable server-side session storage across backend restarts
- Authentication and per-user sandbox/session isolation

## License

MIT

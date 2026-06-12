# Backend — Agent 2.0 API

FastAPI backend for the Agent 2.0 AI coding agent. Manages E2B sandbox sessions, streams OpenRouter tool-calling responses over SSE, and provides sandbox file tree access.

## Tech Stack

- **Framework**: FastAPI 0.115
- **Server**: Uvicorn 0.32
- **Validation**: Pydantic 2
- **HTTP Client**: httpx 0.28
- **Sandbox**: E2B SDK 1.5
- **Testing**: pytest + pytest-asyncio

## Project Structure

```
src/
├── main.py              FastAPI app, routes, SSE streaming
├── agent/
│   ├── agent.py         CodingAgent orchestration logic
│   ├── models.py        Data models
│   └── systemprompt.py  System prompt definitions
├── config/
│   └── settings.py      Pydantic settings
├── services/
│   ├── e2b_service.py   E2B sandbox manager
│   └── openrouter.py    OpenRouter API client
└── tools/
    ├── file_write.py    File write tool implementation
    └── file_read.py     File read tool implementation
```

## Scripts

```bash
python -m uvicorn src.main:app --host 0.0.0.0 --port 8000   # Start server
pytest                                                       # Run tests
```

## API Endpoints

| Method | Path                    | Request Body | Description |
|--------|-------------------------|--------------|-------------|
| GET    | `/health`               | —            | Health check |
| POST   | `/api/openrouter/models`| `{ api_key }` | Fetch available OpenRouter models |
| POST   | `/api/chat/stream`      | `{ message, session_id, openrouter_api_key, e2b_api_key, model, template_id }` | SSE chat stream with tool calls |
| POST   | `/api/files/tree`       | `{ session_id }` | Get sandbox file tree |

## Environment

Create a `.env` file:

```
APP_NAME=Agent 2.0
MAX_ITERATIONS=1000
CORS_ALLOW_ORIGINS=["*"]
E2B_TEMPLATE_ID=
```

## How It Works

1. Client sends a chat message with API keys and model selection.
2. Backend creates (or reuses) an E2B sandbox for the session.
3. OpenRouter is called with native tool definitions for `file_write` and `file_read`.
4. When the LLM invokes a tool, the backend executes it against the sandbox.
5. Tool results are fed back to the LLM; the full exchange is streamed as SSE events.
6. After completion, the client can fetch the updated sandbox file tree.

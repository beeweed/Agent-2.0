# Backend

FastAPI backend for a native-tool-calling AI coding agent that creates an E2B sandbox, streams OpenRouter output over SSE, executes `file_write` and `file_read` as structured native tool calls, and returns live file-tree updates.

## Run

```bash
cd /home/user/webapp/backend
python -m uvicorn src.main:app --host 0.0.0.0 --port 8000
```

## Endpoints

- `GET /health`
- `POST /api/openrouter/models`
- `POST /api/chat/stream`
- `POST /api/files/tree`

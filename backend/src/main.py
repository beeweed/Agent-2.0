from __future__ import annotations

import json
from typing import Any, AsyncGenerator

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field

from src.agent.agent import CodingAgent
from src.config.settings import settings
from src.services.e2b_service import sandbox_manager
from src.services.openrouter import openrouter_client


class ModelRequest(BaseModel):
    api_key: str = Field(min_length=1)


class ChatStreamRequest(BaseModel):
    message: str = Field(min_length=1)
    session_id: str | None = None
    openrouter_api_key: str = Field(min_length=1)
    e2b_api_key: str = Field(min_length=1)
    model: str = Field(min_length=1)
    template_id: str | None = None


class FileTreeRequest(BaseModel):
    session_id: str = Field(min_length=1)


app = FastAPI(title=settings.app_name, version="1.0.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_allow_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

agent = CodingAgent(sandbox_manager=sandbox_manager)


def encode_sse(event: dict[str, Any]) -> str:
    return f"event: {event.get('type', 'message')}\ndata: {json.dumps(event, ensure_ascii=False)}\n\n"


@app.get("/health")
async def health() -> dict[str, Any]:
    return {"ok": True, "app": settings.app_name, "max_iterations": settings.max_iterations}


@app.post("/api/openrouter/models")
async def openrouter_models(payload: ModelRequest) -> dict[str, Any]:
    try:
        models = await openrouter_client.list_models(payload.api_key)
        return {"models": models}
    except Exception as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@app.post("/api/chat/stream")
async def chat_stream(payload: ChatStreamRequest) -> StreamingResponse:
    async def event_stream() -> AsyncGenerator[str, None]:
        try:
            async for event in agent.run(
                message=payload.message,
                session_id=payload.session_id,
                openrouter_api_key=payload.openrouter_api_key,
                e2b_api_key=payload.e2b_api_key,
                model=payload.model,
                template_id=payload.template_id,
            ):
                yield encode_sse(event)
        except Exception as exc:
            yield encode_sse({"type": "error", "message": str(exc)})

    return StreamingResponse(
        event_stream(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache, no-transform",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )


@app.post("/api/files/tree")
async def file_tree(payload: FileTreeRequest) -> dict[str, Any]:
    try:
        return {"tree": await sandbox_manager.file_tree(payload.session_id)}
    except Exception as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc

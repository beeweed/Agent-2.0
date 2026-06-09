import json
from typing import Any
from pydantic import BaseModel, Field, field_validator


FILE_WRITE_TOOL_SCHEMA = {
    "type": "function",
    "function": {
        "name": "file_write",
        "description": "Create or overwrite a file at the given path inside the sandbox. Use for creating new files or fully rewriting existing ones.",
        "parameters": {
            "type": "object",
            "properties": {
                "file_path": {
                    "type": "string",
                    "description": "Absolute path starting with /home/user/. Example: /home/user/project/src/App.tsx"
                },
                "content": {
                    "type": "string",
                    "description": "The full content to write to the file."
                }
            },
            "required": ["file_path", "content"]
        }
    }
}


class FileWriteInput(BaseModel):
    file_path: str = Field(min_length=11)
    content: str

    @field_validator("file_path")
    @classmethod
    def validate_path(cls, value: str) -> str:
        if not value.startswith("/home/user/"):
            raise ValueError("file_path must be an absolute path starting with /home/user/.")
        if "\x00" in value:
            raise ValueError("file_path contains a null byte.")
        return value


async def write_file_to_sandbox(sandbox_manager: Any, session_id: str, **kwargs: Any) -> str:
    try:
        payload = FileWriteInput(**kwargs)
        await sandbox_manager.write_file(session_id, payload.file_path, payload.content)
        sandbox_manager.remember_file(session_id, payload.file_path)
        return json.dumps(
            {
                "ok": True,
                "tool": "file_write",
                "file_path": payload.file_path,
                "bytes_written": len(payload.content.encode("utf-8")),
            },
            ensure_ascii=False,
        )
    except Exception as exc:
        return json.dumps(
            {
                "ok": False,
                "tool": "file_write",
                "is_error": True,
                "error_type": exc.__class__.__name__,
                "message": str(exc),
            },
            ensure_ascii=False,
        )

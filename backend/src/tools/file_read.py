import json
from typing import Any
from pydantic import BaseModel, Field, field_validator


FILE_READ_TOOL_SCHEMA = {
    "type": "function",
    "function": {
        "name": "file_read",
        "description": "Read the content of an existing file from the sandbox. Returns content with line numbers.",
        "parameters": {
            "type": "object",
            "properties": {
                "file_path": {
                    "type": "string",
                    "description": "Absolute path starting with /home/user/. Example: /home/user/project/src/main.py"
                }
            },
            "required": ["file_path"]
        }
    }
}


class FileReadInput(BaseModel):
    file_path: str = Field(min_length=11)

    @field_validator("file_path")
    @classmethod
    def validate_path(cls, value: str) -> str:
        if not value.startswith("/home/user/"):
            raise ValueError("file_path must be an absolute path starting with /home/user/.")
        if "\x00" in value:
            raise ValueError("file_path contains a null byte.")
        return value


def _with_line_numbers(content: str) -> str:
    lines = content.splitlines()
    if not lines and content == "":
        return ""
    return "\n".join(f"{index + 1:>6}\t{line}" for index, line in enumerate(lines))


async def read_file_from_sandbox(sandbox_manager: Any, session_id: str, **kwargs: Any) -> str:
    try:
        payload = FileReadInput(**kwargs)
        content = await sandbox_manager.read_file(session_id, payload.file_path)
        sandbox_manager.remember_file(session_id, payload.file_path)
        return json.dumps(
            {
                "ok": True,
                "tool": "file_read",
                "file_path": payload.file_path,
                "content": _with_line_numbers(content),
            },
            ensure_ascii=False,
        )
    except Exception as exc:
        return json.dumps(
            {
                "ok": False,
                "tool": "file_read",
                "is_error": True,
                "error_type": exc.__class__.__name__,
                "message": str(exc),
            },
            ensure_ascii=False,
        )

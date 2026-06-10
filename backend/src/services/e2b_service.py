from __future__ import annotations

import asyncio
from dataclasses import dataclass, field
from pathlib import PurePosixPath
from typing import Any
from uuid import uuid4

from src.config.settings import settings


@dataclass
class SandboxSession:
    session_id: str
    sandbox: Any
    known_files: set[str] = field(default_factory=set)


class SandboxNotFoundError(RuntimeError):
    pass


class E2BSandboxManager:
    def __init__(self) -> None:
        self._sessions: dict[str, SandboxSession] = {}
        self._lock = asyncio.Lock()

    def has_session(self, session_id: str | None) -> bool:
        return bool(session_id and session_id in self._sessions)

    async def get_or_create(
        self,
        session_id: str | None,
        api_key: str,
        template_id: str | None = None,
    ) -> tuple[SandboxSession, bool]:
        if not api_key:
            raise ValueError("E2B API key is required before chat can start.")

        async with self._lock:
            resolved_session_id = session_id or str(uuid4())
            existing = self._sessions.get(resolved_session_id)
            if existing:
                return existing, False

            sandbox = await asyncio.to_thread(self._create_sandbox, api_key, template_id)
            created = SandboxSession(session_id=resolved_session_id, sandbox=sandbox)
            self._sessions[resolved_session_id] = created
            return created, True

    def _create_sandbox(self, api_key: str, template_id: str | None) -> Any:
        try:
            from e2b import Sandbox
        except Exception as exc:  # pragma: no cover - dependency/runtime guard
            raise RuntimeError("The official e2b SDK is not installed or could not be imported.") from exc

        kwargs: dict[str, Any] = {
            "api_key": api_key,
            "timeout": settings.sandbox_timeout_seconds,
        }
        if template_id:
            kwargs["template"] = template_id

        if hasattr(Sandbox, "create"):
            return Sandbox.create(**kwargs)

        # Compatibility fallback for SDK releases exposing a constructor instead of create().
        return Sandbox(**kwargs)

    def get(self, session_id: str) -> SandboxSession:
        session = self._sessions.get(session_id)
        if not session:
            raise SandboxNotFoundError("Sandbox session does not exist. Send a chat message with an E2B API key first.")
        return session

    def remember_file(self, session_id: str, file_path: str) -> None:
        if session_id in self._sessions:
            self._sessions[session_id].known_files.add(file_path)

    async def write_file(self, session_id: str, file_path: str, content: str) -> None:
        session = self.get(session_id)
        await asyncio.to_thread(self._write_file_sync, session.sandbox, file_path, content)
        session.known_files.add(file_path)

    def _write_file_sync(self, sandbox: Any, file_path: str, content: str) -> None:
        files_api = getattr(sandbox, "files", None)
        if not files_api or not hasattr(files_api, "write"):
            raise RuntimeError("The active E2B sandbox SDK does not expose sandbox.files.write().")
        files_api.write(file_path, content)

    async def read_file(self, session_id: str, file_path: str) -> str:
        session = self.get(session_id)
        content = await asyncio.to_thread(self._read_file_sync, session.sandbox, file_path)
        session.known_files.add(file_path)
        return content

    def _read_file_sync(self, sandbox: Any, file_path: str) -> str:
        files_api = getattr(sandbox, "files", None)
        if not files_api or not hasattr(files_api, "read"):
            raise RuntimeError("The active E2B sandbox SDK does not expose sandbox.files.read().")
        content = files_api.read(file_path)
        if isinstance(content, bytes):
            return content.decode("utf-8", errors="replace")
        return str(content)

    async def file_tree(self, session_id: str) -> dict[str, Any]:
        session = self.get(session_id)
        paths = set(session.known_files)
        paths.update(await self._discover_files(session))
        return self._build_tree(sorted(paths))

    async def _discover_files(self, session: SandboxSession) -> set[str]:
        sandbox = session.sandbox
        discovered: set[str] = set()
        commands = getattr(sandbox, "commands", None)
        if not commands or not hasattr(commands, "run"):
            return discovered

        def run_find() -> Any:
            return commands.run("find /home/user -maxdepth 6 -type f 2>/dev/null | sort | head -1000")

        try:
            result = await asyncio.to_thread(run_find)
            stdout = getattr(result, "stdout", None) or getattr(result, "text", None) or str(result)
            for line in str(stdout).splitlines():
                line = line.strip()
                if line.startswith("/home/user/"):
                    discovered.add(line)
        except Exception:
            return discovered
        return discovered

    def _build_tree(self, paths: list[str]) -> dict[str, Any]:
        root: dict[str, Any] = {"name": "user", "path": "/home/user", "type": "directory", "children": []}
        directory_index: dict[str, dict[str, Any]] = {"/home/user": root}

        for path in paths:
            if not path.startswith("/home/user/"):
                continue
            parts = PurePosixPath(path).parts
            current_path = ""
            parent = root
            for idx, part in enumerate(parts):
                if idx == 0:
                    current_path = "/"
                    continue
                current_path = (PurePosixPath(current_path) / part).as_posix() if current_path != "/" else f"/{part}"
                if current_path == "/home" or current_path == "/home/user":
                    continue
                is_file = idx == len(parts) - 1
                existing = next((child for child in parent["children"] if child["path"] == current_path), None)
                if existing is None:
                    existing = {
                        "name": part,
                        "path": current_path,
                        "type": "file" if is_file else "directory",
                        "children": [] if not is_file else None,
                    }
                    parent["children"].append(existing)
                    if not is_file:
                        directory_index[current_path] = existing
                if not is_file:
                    parent = existing

        self._sort_tree(root)
        return root

    def _sort_tree(self, node: dict[str, Any]) -> None:
        children = node.get("children") or []
        children.sort(key=lambda item: (item["type"] == "file", item["name"].lower()))
        for child in children:
            if child.get("children") is not None:
                self._sort_tree(child)


sandbox_manager = E2BSandboxManager()

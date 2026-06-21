import json
import re
import asyncio
from typing import AsyncGenerator, Optional, Callable, Any

import httpx

from src.agent.systemprompt import SYSTEM_PROMPT
from src.config.settings import settings
from src.services.e2b_service import E2BSandboxManager
from src.services.openrouter import openrouter_client
from src.services.nvidia_nim import nvidia_nim_client
from src.tools import TOOL_REGISTRY, TOOL_SCHEMAS


SSEvent = dict[str, Any]


class StreamAccumulator:
    def __init__(self) -> None:
        self.content_parts: list[str] = []
        self.tool_call_parts: dict[int, dict[str, Any]] = {}
        self.finish_reason: str | None = None

    def add_content(self, value: str) -> None:
        if value:
            self.content_parts.append(value)

    def add_tool_delta(self, tool_delta: dict[str, Any]) -> None:
        index = int(tool_delta.get("index", 0))
        current = self.tool_call_parts.setdefault(
            index,
            {"id": None, "type": "function", "function": {"name": "", "arguments": ""}},
        )
        if tool_delta.get("id"):
            current["id"] = tool_delta["id"]
        if tool_delta.get("type"):
            current["type"] = tool_delta["type"]
        function_delta = tool_delta.get("function") or {}
        if function_delta.get("name"):
            current["function"]["name"] += function_delta["name"]
        if function_delta.get("arguments"):
            current["function"]["arguments"] += function_delta["arguments"]

    @property
    def content(self) -> str:
        return "".join(self.content_parts)

    def tool_calls(self) -> list[dict[str, Any]]:
        return [self.tool_call_parts[index] for index in sorted(self.tool_call_parts)]

    def assistant_message(self) -> dict[str, Any]:
        message: dict[str, Any] = {"role": "assistant", "content": self.content or None}
        calls = self.tool_calls()
        if calls:
            message["tool_calls"] = calls
        return message


class AgentRequest(BaseException):
    pass


class CodingAgent:
    def __init__(self, sandbox_manager: E2BSandboxManager) -> None:
        self.sandbox_manager = sandbox_manager
        self.histories: dict[str, list[dict[str, Any]]] = {}
        self._history_lock = asyncio.Lock()

    async def run(
        self,
        *,
        message: str,
        session_id: Optional[str],
        openrouter_api_key: str,
        nvidia_nim_api_key: str = "",
        e2b_api_key: str,
        model: str,
        provider: str = "openrouter",
        template_id: Optional[str] = None,
        on_event: Optional[Callable[[SSEvent], None]] = None,
    ) -> AsyncGenerator[SSEvent, None]:
        sanitized_message = self._sanitize_user_message(message)
        if not sanitized_message:
            yield {"type": "error", "message": "Message cannot be empty."}
            return
        if provider == "openrouter" and not openrouter_api_key:
            yield {"type": "error", "message": "OpenRouter API key is required."}
            return
        if provider == "nvidia" and not nvidia_nim_api_key:
            yield {"type": "error", "message": "NVIDIA NIM API key is required."}
            return
        if not model:
            yield {"type": "error", "message": "Model selection is required."}
            return

        yield {"type": "iteration_reset", "iteration": 0, "max_iterations": settings.max_iterations}
        should_create_sandbox = not self.sandbox_manager.has_session(session_id)
        if should_create_sandbox:
            yield {"type": "status", "state": "creating_sandbox", "message": "creating sandbox..."}

        try:
            session, created_sandbox = await self.sandbox_manager.get_or_create(session_id, e2b_api_key, template_id)
        except Exception as exc:
            yield {"type": "error", "message": f"Failed to create E2B sandbox: {exc}"}
            return

        if created_sandbox:
            yield {"type": "sandbox_created", "session_id": session.session_id, "message": "Sandbox is ready."}

        async with self._history_lock:
            history = self.histories.setdefault(session.session_id, [{"role": "system", "content": SYSTEM_PROMPT}])
            history.append({"role": "user", "content": sanitized_message})
            messages = list(history)

        final_answer = ""
        for iteration in range(1, settings.max_iterations + 1):
            yield {"type": "iteration", "iteration": iteration, "max_iterations": settings.max_iterations}
            accumulator = StreamAccumulator()

            stream_api_key = openrouter_api_key if provider == "openrouter" else nvidia_nim_api_key
            async for stream_event in self._stream(
                api_key=stream_api_key,
                model=model,
                messages=messages,
                accumulator=accumulator,
                provider=provider,
            ):
                if on_event:
                    on_event(stream_event)
                yield stream_event

            assistant_message = accumulator.assistant_message()
            messages.append(assistant_message)
            tool_calls = accumulator.tool_calls()
            if not tool_calls:
                final_answer = accumulator.content
                async with self._history_lock:
                    self.histories[session.session_id] = messages
                yield {"type": "done", "session_id": session.session_id, "content": final_answer}
                return

            for tool_call in tool_calls:
                tool_name = tool_call.get("function", {}).get("name", "")
                raw_arguments = tool_call.get("function", {}).get("arguments") or "{}"
                tool_call_id = tool_call.get("id") or f"call_{iteration}_{tool_name}"
                arguments = self._parse_tool_arguments(raw_arguments)
                file_path = arguments.get("file_path", "")
                action = "read" if tool_name == "file_read" else "create" if tool_name == "file_write" else tool_name

                yield {
                    "type": "tool_call",
                    "id": tool_call_id,
                    "name": tool_name,
                    "action": action,
                    "file_path": file_path,
                    "arguments": arguments,
                    "message": f"{action}: {file_path}" if file_path else action,
                }

                tool_executor = TOOL_REGISTRY.get(tool_name)
                if not tool_executor:
                    result = json.dumps({"ok": False, "is_error": True, "message": f"Unknown tool: {tool_name}"})
                else:
                    result = await tool_executor(self.sandbox_manager, session.session_id, **arguments)

                messages.append({"role": "tool", "tool_call_id": tool_call_id, "name": tool_name, "content": result})
                yield {
                    "type": "tool_result",
                    "id": tool_call_id,
                    "name": tool_name,
                    "action": action,
                    "file_path": file_path,
                    "content": result,
                }
                try:
                    tree = await self.sandbox_manager.file_tree(session.session_id)
                    yield {"type": "file_tree", "tree": tree}
                except Exception:
                    pass

        async with self._history_lock:
            self.histories[session.session_id] = messages
        yield {
            "type": "error",
            "message": "Maximum iteration limit reached. Returning progress made so far.",
            "iteration": settings.max_iterations,
        }

    async def _stream(
        self,
        *,
        api_key: str,
        model: str,
        messages: list[dict[str, Any]],
        accumulator: StreamAccumulator,
        provider: str = "openrouter",
    ) -> AsyncGenerator[SSEvent, None]:
        if provider == "nvidia":
            base_url = nvidia_nim_client.base_url
            headers = nvidia_nim_client.headers(api_key)
        else:
            base_url = openrouter_client.base_url
            headers = openrouter_client.headers(api_key)

        payload = {
            "model": model,
            "messages": messages,
            "tools": TOOL_SCHEMAS,
            "tool_choice": "auto",
            "stream": True,
        }
        timeout = httpx.Timeout(connect=30.0, read=300.0, write=30.0, pool=30.0)
        async with httpx.AsyncClient(timeout=timeout) as client:
            async with client.stream(
                "POST",
                f"{base_url}/chat/completions",
                headers=headers,
                json=payload,
            ) as response:
                if response.status_code >= 400:
                    error_text = await response.aread()
                    yield {"type": "error", "message": self._safe_error(error_text.decode("utf-8", errors="replace"))}
                    return

                async for line in response.aiter_lines():
                    if not line or not line.startswith("data:"):
                        continue
                    data = line.removeprefix("data:").strip()
                    if data == "[DONE]":
                        return
                    try:
                        chunk = json.loads(data)
                    except json.JSONDecodeError:
                        continue
                    choice = (chunk.get("choices") or [{}])[0]
                    accumulator.finish_reason = choice.get("finish_reason") or accumulator.finish_reason
                    delta = choice.get("delta") or {}
                    content = delta.get("content")
                    if isinstance(content, str) and content:
                        accumulator.add_content(content)
                        yield {"type": "token", "content": content}
                    for tool_delta in delta.get("tool_calls") or []:
                        accumulator.add_tool_delta(tool_delta)

    def _parse_tool_arguments(self, raw_arguments: str) -> dict[str, Any]:
        try:
            parsed = json.loads(raw_arguments or "{}")
            return parsed if isinstance(parsed, dict) else {}
        except json.JSONDecodeError:
            repaired = re.sub(r",\s*}", "}", raw_arguments)
            repaired = re.sub(r",\s*]", "]", repaired)
            try:
                parsed = json.loads(repaired)
                return parsed if isinstance(parsed, dict) else {}
            except json.JSONDecodeError:
                return {}

    def _sanitize_user_message(self, value: str) -> str:
        return value.replace("\x00", "").strip()

    def _safe_error(self, error_text: str) -> str:
        try:
            parsed = json.loads(error_text)
            message = parsed.get("error", {}).get("message") or parsed.get("message") or error_text
        except Exception:
            message = error_text
        return message[:4000]

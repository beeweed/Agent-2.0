import json
from types import SimpleNamespace

import pytest

from src.agent.agent import CodingAgent
from src.tools.file_read import read_file_from_sandbox
from src.tools.file_write import write_file_to_sandbox


class FakeSandboxManager:
    def __init__(self):
        self.files = {}
        self.remembered = set()

    async def write_file(self, session_id, file_path, content):
        self.files[file_path] = content

    async def read_file(self, session_id, file_path):
        if file_path not in self.files:
            raise FileNotFoundError(file_path)
        return self.files[file_path]

    def remember_file(self, session_id, file_path):
        self.remembered.add(file_path)


@pytest.mark.asyncio
async def test_file_write_and_read_success():
    manager = FakeSandboxManager()
    write_result = json.loads(await write_file_to_sandbox(manager, "s1", file_path="/home/user/app.py", content="print('ok')"))
    read_result = json.loads(await read_file_from_sandbox(manager, "s1", file_path="/home/user/app.py"))

    assert write_result["ok"] is True
    assert write_result["bytes_written"] == len("print('ok')".encode())
    assert read_result["ok"] is True
    assert "print('ok')" in read_result["content"]


@pytest.mark.asyncio
async def test_file_read_structured_error_for_missing_file():
    manager = FakeSandboxManager()
    result = json.loads(await read_file_from_sandbox(manager, "s1", file_path="/home/user/missing.txt"))

    assert result["ok"] is False
    assert result["is_error"] is True
    assert result["error_type"] == "FileNotFoundError"


@pytest.mark.asyncio
async def test_path_validation_blocks_outside_home_user():
    manager = FakeSandboxManager()
    result = json.loads(await write_file_to_sandbox(manager, "s1", file_path="/tmp/evil.txt", content="x"))

    assert result["ok"] is False
    assert result["is_error"] is True


class FakeAgentSandboxManager:
    def __init__(self):
        self.sessions = {}

    def has_session(self, session_id):
        return bool(session_id and session_id in self.sessions)

    async def get_or_create(self, session_id, api_key, template_id=None):
        resolved_session_id = session_id or "session-1"
        if resolved_session_id in self.sessions:
            return self.sessions[resolved_session_id], False
        session = SimpleNamespace(session_id=resolved_session_id, sandbox=object())
        self.sessions[resolved_session_id] = session
        return session, True


@pytest.mark.asyncio
async def test_agent_only_emits_creating_sandbox_for_new_session(monkeypatch):
    manager = FakeAgentSandboxManager()
    agent = CodingAgent(sandbox_manager=manager)

    async def fake_stream_openrouter(*, api_key, model, messages, accumulator):
        accumulator.add_content("Done")
        yield {"type": "token", "content": "Done"}

    monkeypatch.setattr(agent, "_stream_openrouter", fake_stream_openrouter)

    first_events = [
        event
        async for event in agent.run(
            message="First request",
            session_id=None,
            openrouter_api_key="openrouter-key",
            e2b_api_key="e2b-key",
            model="test-model",
        )
    ]

    assert [event["type"] for event in first_events].count("status") == 1
    assert [event["type"] for event in first_events].count("sandbox_created") == 1
    assert first_events[1]["message"] == "creating sandbox..."
    assert first_events[2]["session_id"] == "session-1"

    second_events = [
        event
        async for event in agent.run(
            message="Follow up request",
            session_id="session-1",
            openrouter_api_key="openrouter-key",
            e2b_api_key="e2b-key",
            model="test-model",
        )
    ]

    second_event_types = [event["type"] for event in second_events]
    assert "status" not in second_event_types
    assert "sandbox_created" not in second_event_types
    assert second_events[-1] == {"type": "done", "session_id": "session-1", "content": "Done"}

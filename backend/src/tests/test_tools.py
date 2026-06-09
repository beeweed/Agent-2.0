import json
import pytest

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

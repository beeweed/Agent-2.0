from .file_read import FILE_READ_TOOL_SCHEMA, read_file_from_sandbox
from .file_write import FILE_WRITE_TOOL_SCHEMA, write_file_to_sandbox

TOOL_SCHEMAS = [FILE_WRITE_TOOL_SCHEMA, FILE_READ_TOOL_SCHEMA]
TOOL_REGISTRY = {
    "file_write": write_file_to_sandbox,
    "file_read": read_file_from_sandbox,
}

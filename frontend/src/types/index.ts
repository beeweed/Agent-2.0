export type Role = 'user' | 'assistant' | 'system';

export interface TextBlock {
  type: 'text';
  content: string;
}

export interface ToolBlock {
  type: 'tool';
  id: string;
  name: string;
  action: string;
  filePath: string;
  status: 'running' | 'done' | 'error';
  content?: string;
}

export type MessageBlock = TextBlock | ToolBlock;

export interface ChatMessage {
  id: string;
  role: Role;
  blocks: MessageBlock[];
  isStreaming?: boolean;
}

export interface ModelInfo {
  id: string;
  name: string;
  context_length?: number;
  supported_parameters?: string[];
  supports_tools?: boolean;
}

export interface FileNode {
  name: string;
  path: string;
  type: 'file' | 'directory';
  children?: FileNode[] | null;
}

export type StreamEvent =
  | { type: 'iteration_reset'; iteration: number; max_iterations: number }
  | { type: 'status'; state: string; message: string }
  | { type: 'sandbox_created'; session_id: string; message: string }
  | { type: 'iteration'; iteration: number; max_iterations: number }
  | { type: 'token'; content: string }
  | { type: 'tool_call'; id: string; name: string; action: string; file_path: string; message: string }
  | { type: 'tool_result'; id: string; name: string; action: string; file_path: string; content: string }
  | { type: 'file_tree'; tree: FileNode }
  | { type: 'done'; session_id: string; content: string }
  | { type: 'error'; message: string; iteration?: number };

import { backendUrl } from '../lib/api';
import { useAppStore } from '../store/useAppStore';
import { createId, parseSseChunk, extractErrorFromToolResult } from '../utils';
import type { StreamEvent } from '../types';

export function useChatStream() {
  const store = useAppStore();

  async function sendMessage(content: string) {
    const trimmed = content.trim();
    if (!trimmed || store.isStreaming) return;

    if (!store.e2bApiKey || !store.selectedModel) {
      store.setError('Add E2B API key and select a model in Settings before chatting.');
      return;
    }
    if (store.provider === 'openrouter' && !store.openrouterApiKey) {
      store.setError('Add OpenRouter API key in Settings before chatting.');
      return;
    }
    if (store.provider === 'nvidia' && !store.nvidiaNimApiKey) {
      store.setError('Add NVIDIA NIM API key in Settings before chatting.');
      return;
    }

    const hasExistingSession = Boolean(store.sessionId);

    store.setError(null);
    store.setStatusText(hasExistingSession ? 'thinking...' : 'creating sandbox...');
    store.setIsStreaming(true);
    const userMessageId = createId('user');
    const assistantMessageId = createId('assistant');
    store.addMessage({ id: userMessageId, role: 'user', blocks: [{ type: 'text', content: trimmed }] });
    store.addMessage({ id: assistantMessageId, role: 'assistant', blocks: [], isStreaming: true });

    try {
      const response = await fetch(`${backendUrl()}/api/chat/stream`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: trimmed,
          session_id: store.sessionId,
          openrouter_api_key: store.openrouterApiKey,
          nvidia_nim_api_key: store.nvidiaNimApiKey,
          e2b_api_key: store.e2bApiKey,
          model: store.selectedModel,
          provider: store.provider,
          template_id: store.templateId || null,
        }),
      });

      if (!response.ok || !response.body) {
        throw new Error(`Chat stream failed with HTTP ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const parsed = parseSseChunk(buffer);
        buffer = parsed.rest;
        parsed.events.forEach((event) => handleStreamEvent(event, assistantMessageId));
      }

      if (buffer.trim()) {
        parseSseChunk(`${buffer}\n\n`).events.forEach((event) => handleStreamEvent(event, assistantMessageId));
      }
    } catch (error) {
      store.setError(error instanceof Error ? error.message : 'Unexpected chat stream error.');
      store.setMessageStreaming(assistantMessageId, false);
    } finally {
      store.setIsStreaming(false);
      store.setStatusText('');
      store.setMessageStreaming(assistantMessageId, false);
    }
  }

  function handleStreamEvent(event: StreamEvent, assistantMessageId: string) {
    switch (event.type) {
      case 'iteration_reset':
      case 'iteration':
        store.setIteration(event.iteration, event.max_iterations);
        break;
      case 'status':
        store.setStatusText(event.message);
        break;
      case 'sandbox_created':
        store.setSessionId(event.session_id);
        store.setStatusText('thinking...');
        break;
      case 'token':
        store.appendAssistantToken(assistantMessageId, event.content);
        store.setStatusText('thinking...');
        break;
      case 'tool_call':
        store.addToolBlock(assistantMessageId, {
          type: 'tool',
          id: event.id,
          name: event.name,
          action: event.action,
          filePath: event.file_path,
          status: 'running',
        });
        store.setStatusText('thinking...');
        break;
      case 'tool_result': {
        const isError = extractErrorFromToolResult(event.content);
        store.updateToolBlock(assistantMessageId, event.id, {
          status: isError ? 'error' : 'done',
          content: event.content,
        });

        // Store file content for the code editor if available
        if (event.file_path && event.content && !isError) {
          store.setFileContent(event.file_path, event.content);
        }

        if (event.file_path) {
          store.showToast('File completed', event.file_path);
        }
        break;
      }
      case 'file_tree':
        store.setFileTree(event.tree);
        break;
      case 'done':
        store.setSessionId(event.session_id);
        store.setStatusText('');
        store.setMessageStreaming(assistantMessageId, false);
        break;
      case 'error':
        store.setError(event.message);
        store.setStatusText('');
        store.setMessageStreaming(assistantMessageId, false);
        break;
      default:
        break;
    }
  }

  return { sendMessage };
}

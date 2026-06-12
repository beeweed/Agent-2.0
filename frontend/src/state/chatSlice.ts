import type { StateCreator } from 'zustand';
import type { ChatMessage, MessageBlock, ModelInfo } from '../types';

export interface ChatSlice {
  messages: ChatMessage[];
  models: ModelInfo[];
  sessionId: string | null;
  iteration: number;
  maxIterations: number;
  isStreaming: boolean;
  setModels: (models: ModelInfo[]) => void;
  addMessage: (message: ChatMessage) => void;
  appendAssistantToken: (messageId: string, token: string) => void;
  addToolBlock: (messageId: string, block: MessageBlock) => void;
  updateToolBlock: (
    messageId: string,
    toolId: string,
    updates: Partial<{ status: 'running' | 'done' | 'error'; content: string }>,
  ) => void;
  setMessageStreaming: (messageId: string, isStreaming: boolean) => void;
  setSessionId: (sessionId: string | null) => void;
  setIteration: (iteration: number, maxIterations: number) => void;
  setIsStreaming: (value: boolean) => void;
  resetConversation: () => void;
}

export const createChatSlice: StateCreator<ChatSlice, [], [], ChatSlice> = (set) => ({
  messages: [],
  models: [],
  sessionId: null,
  iteration: 0,
  maxIterations: 1000,
  isStreaming: false,

  setModels: (models) => set({ models }),

  addMessage: (message) => set((state) => ({ messages: [...state.messages, message] })),

  appendAssistantToken: (messageId, token) =>
    set((state) => ({
      messages: state.messages.map((message) => {
        if (message.id !== messageId) return message;
        const blocks = [...message.blocks];
        const lastBlock = blocks[blocks.length - 1];
        if (lastBlock && lastBlock.type === 'text') {
          blocks[blocks.length - 1] = { type: 'text', content: lastBlock.content + token };
        } else {
          blocks.push({ type: 'text', content: token });
        }
        return { ...message, blocks };
      }),
    })),

  addToolBlock: (messageId, block) =>
    set((state) => ({
      messages: state.messages.map((message) =>
        message.id === messageId ? { ...message, blocks: [...message.blocks, block] } : message,
      ),
    })),

  updateToolBlock: (messageId, toolId, updates) =>
    set((state) => ({
      messages: state.messages.map((message) =>
        message.id === messageId
          ? {
              ...message,
              blocks: message.blocks.map((block) =>
                block.type === 'tool' && block.id === toolId ? { ...block, ...updates } : block,
              ),
            }
          : message,
      ),
    })),

  setMessageStreaming: (messageId, isStreaming) =>
    set((state) => ({
      messages: state.messages.map((message) =>
        message.id === messageId ? { ...message, isStreaming } : message,
      ),
    })),

  setSessionId: (sessionId) => set({ sessionId }),

  setIteration: (iteration, maxIterations) => set({ iteration, maxIterations }),

  setIsStreaming: (isStreaming) => set({ isStreaming }),

  resetConversation: () =>
    set({
      messages: [],
      sessionId: null,
      iteration: 0,
      isStreaming: false,
    }),
});

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ChatMessage, FileNode, ModelInfo, ToolActivity } from '../types';

interface PersistedSettings {
  openrouterApiKey: string;
  e2bApiKey: string;
  templateId: string;
  selectedModel: string;
}

interface ToastState {
  message: string;
  submessage: string;
  visible: boolean;
}

interface AppState extends PersistedSettings {
  messages: ChatMessage[];
  toolActivities: ToolActivity[];
  models: ModelInfo[];
  fileTree: FileNode | null;
  sessionId: string | null;
  iteration: number;
  maxIterations: number;
  statusText: string;
  isStreaming: boolean;
  error: string | null;
  memoryOpen: boolean;
  selectedFilePath: string | null;
  fileContents: Record<string, string>;
  toast: ToastState;
  setSettings: (settings: Partial<PersistedSettings>) => void;
  setModels: (models: ModelInfo[]) => void;
  addMessage: (message: ChatMessage) => void;
  appendAssistantToken: (messageId: string, token: string) => void;
  setMessageStreaming: (messageId: string, isStreaming: boolean) => void;
  addToolActivity: (activity: ToolActivity) => void;
  completeToolActivity: (id: string, content: string, isError?: boolean) => void;
  setFileTree: (tree: FileNode | null) => void;
  setSessionId: (sessionId: string | null) => void;
  setIteration: (iteration: number, maxIterations: number) => void;
  setStatusText: (statusText: string) => void;
  setIsStreaming: (value: boolean) => void;
  setError: (error: string | null) => void;
  resetConversation: () => void;
  setMemoryOpen: (open: boolean) => void;
  setSelectedFilePath: (path: string | null) => void;
  setFileContent: (path: string, content: string) => void;
  showToast: (message: string, submessage: string) => void;
  hideToast: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      openrouterApiKey: '',
      e2bApiKey: '',
      templateId: '',
      selectedModel: '',
      messages: [],
      toolActivities: [],
      models: [],
      fileTree: null,
      sessionId: null,
      iteration: 0,
      maxIterations: 1000,
      statusText: '',
      isStreaming: false,
      error: null,
      memoryOpen: false,
      selectedFilePath: null,
      fileContents: {},
      toast: { message: '', submessage: '', visible: false },
      setSettings: (settings) => set(settings),
      setModels: (models) => set({ models }),
      addMessage: (message) => set((state) => ({ messages: [...state.messages, message] })),
      appendAssistantToken: (messageId, token) =>
        set((state) => ({
          messages: state.messages.map((message) =>
            message.id === messageId ? { ...message, content: message.content + token } : message,
          ),
        })),
      setMessageStreaming: (messageId, isStreaming) =>
        set((state) => ({
          messages: state.messages.map((message) => (message.id === messageId ? { ...message, isStreaming } : message)),
        })),
      addToolActivity: (activity) => set((state) => ({ toolActivities: [...state.toolActivities, activity] })),
      completeToolActivity: (id, content, isError) =>
        set((state) => ({
          toolActivities: state.toolActivities.map((activity) =>
            activity.id === id ? { ...activity, status: isError ? 'error' : 'done', content } : activity,
          ),
        })),
      setFileTree: (fileTree) => set({ fileTree }),
      setSessionId: (sessionId) => set({ sessionId }),
      setIteration: (iteration, maxIterations) => set({ iteration, maxIterations }),
      setStatusText: (statusText) => set({ statusText }),
      setIsStreaming: (isStreaming) => set({ isStreaming }),
      setError: (error) => set({ error }),
      resetConversation: () =>
        set({
          messages: [],
          toolActivities: [],
          fileTree: null,
          sessionId: null,
          iteration: 0,
          statusText: '',
          isStreaming: false,
          error: null,
        }),
      setMemoryOpen: (memoryOpen) => set({ memoryOpen }),
      setSelectedFilePath: (selectedFilePath) => set({ selectedFilePath }),
      setFileContent: (path, content) =>
        set((state) => ({ fileContents: { ...state.fileContents, [path]: content } })),
      showToast: (message, submessage) => set({ toast: { message, submessage, visible: true } }),
      hideToast: () => set({ toast: { message: '', submessage: '', visible: false } }),
    }),
    {
      name: 'e2b-agent-settings',
      partialize: (state) => ({
        openrouterApiKey: state.openrouterApiKey,
        e2bApiKey: state.e2bApiKey,
        templateId: state.templateId,
        selectedModel: state.selectedModel,
      }),
    },
  ),
);

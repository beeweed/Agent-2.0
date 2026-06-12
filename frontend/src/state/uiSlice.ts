import type { StateCreator } from 'zustand';

interface ToastState {
  message: string;
  submessage: string;
  visible: boolean;
}

export interface UISlice {
  statusText: string;
  error: string | null;
  memoryOpen: boolean;
  toast: ToastState;
  setStatusText: (statusText: string) => void;
  setError: (error: string | null) => void;
  setMemoryOpen: (open: boolean) => void;
  showToast: (message: string, submessage: string) => void;
  hideToast: () => void;
}

const emptyToast: ToastState = { message: '', submessage: '', visible: false };

export const createUiSlice: StateCreator<UISlice, [], [], UISlice> = (set) => ({
  statusText: '',
  error: null,
  memoryOpen: false,
  toast: emptyToast,

  setStatusText: (statusText) => set({ statusText }),

  setError: (error) => set({ error }),

  setMemoryOpen: (memoryOpen) => set({ memoryOpen }),

  showToast: (message, submessage) => set({ toast: { message, submessage, visible: true } }),

  hideToast: () => set({ toast: emptyToast }),
});

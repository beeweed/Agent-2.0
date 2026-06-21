import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ChatSlice } from './chatSlice';
import type { SettingsSlice, PersistedSettings } from './settingsSlice';
import type { UISlice } from './uiSlice';
import type { FilesSlice } from './filesSlice';
import { createChatSlice } from './chatSlice';
import { createSettingsSlice } from './settingsSlice';
import { createUiSlice } from './uiSlice';
import { createFilesSlice } from './filesSlice';

export type AppState = ChatSlice & SettingsSlice & UISlice & FilesSlice;

export const useAppStore = create<AppState>()(
  persist(
    (...a) => ({
      ...createChatSlice(...a),
      ...createSettingsSlice(...a),
      ...createUiSlice(...a),
      ...createFilesSlice(...a),
    }),
    {
      name: 'e2b-agent-settings',
      partialize: (state) => ({
        openrouterApiKey: state.openrouterApiKey,
        nvidiaNimApiKey: state.nvidiaNimApiKey,
        e2bApiKey: state.e2bApiKey,
        templateId: state.templateId,
        selectedModel: state.selectedModel,
        provider: state.provider,
        models: state.models,
      } as Partial<PersistedSettings>),
    },
  ),
);

export type { PersistedSettings } from './settingsSlice';

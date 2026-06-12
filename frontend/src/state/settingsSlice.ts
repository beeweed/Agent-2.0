import type { StateCreator } from 'zustand';

export interface PersistedSettings {
  openrouterApiKey: string;
  e2bApiKey: string;
  templateId: string;
  selectedModel: string;
}

export interface SettingsSlice extends PersistedSettings {
  setSettings: (settings: Partial<PersistedSettings>) => void;
}

export const initialSettings: PersistedSettings = {
  openrouterApiKey: '',
  e2bApiKey: '',
  templateId: '',
  selectedModel: '',
};

export const createSettingsSlice: StateCreator<SettingsSlice, [], [], SettingsSlice> = (set) => ({
  ...initialSettings,

  setSettings: (settings) => set(settings),
});

import type { StateCreator } from 'zustand';

export interface PersistedSettings {
  openrouterApiKey: string;
  nvidiaNimApiKey: string;
  e2bApiKey: string;
  templateId: string;
  selectedModel: string;
  provider: 'openrouter' | 'nvidia';
}

export interface SettingsSlice extends PersistedSettings {
  setSettings: (settings: Partial<PersistedSettings>) => void;
}

export const initialSettings: PersistedSettings = {
  openrouterApiKey: '',
  nvidiaNimApiKey: '',
  e2bApiKey: '',
  templateId: '',
  selectedModel: '',
  provider: 'openrouter',
};

export const createSettingsSlice: StateCreator<SettingsSlice, [], [], SettingsSlice> = (set) => ({
  ...initialSettings,

  setSettings: (settings) => set(settings),
});

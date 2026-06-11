import { useMemo, useState, useEffect, useRef } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { fetchModels } from '../lib/api';
import { useAppStore } from '../store/useAppStore';

export function SettingsDialog() {
  const {
    openrouterApiKey,
    e2bApiKey,
    templateId,
    selectedModel,
    models,
    setSettings,
    setModels,
  } = useAppStore();
  const [open, setOpen] = useState(false);
  const [modelStatus, setModelStatus] = useState('');
  const [modelSearch, setModelSearch] = useState('');
  const toolCapableModels = useMemo(() => models.filter((model) => model.supports_tools), [models]);
  const shownModels = useMemo(() => {
    const all = toolCapableModels.length > 0 ? toolCapableModels : models;
    if (!modelSearch) return all;
    const q = modelSearch.toLowerCase();
    return all.filter((m) => m.id.toLowerCase().includes(q) || (m.name && m.name.toLowerCase().includes(q)));
  }, [models, toolCapableModels, modelSearch]);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setTimeout(() => searchRef.current?.focus(), 100);
    }
  }, [open]);

  async function handleLoadModels() {
    try {
      setModelStatus('Loading OpenRouter models...');
      const result = await fetchModels(openrouterApiKey);
      setModels(result);
      const firstToolModel = result.find((model) => model.supports_tools) ?? result[0];
      if (firstToolModel && !selectedModel) {
        setSettings({ selectedModel: firstToolModel.id });
      }
      setModelStatus(`Loaded ${result.length} models${result.filter((m) => m.supports_tools).length ? ` (${result.filter((m) => m.supports_tools).length} with tool support)` : ''}.`);
    } catch (error) {
      setModelStatus(error instanceof Error ? error.message : 'Failed to load models.');
    }
  }

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <button className="p-2.5 rounded-xl text-muted-foreground hover:text-foreground hover:bg-white/5 transition-all duration-200">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="DialogOverlay" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg max-h-[85vh] bg-[#2d2d2d] rounded-2xl border border-border/30 shadow-2xl overflow-hidden z-50 animate-fade-in focus:outline-none">
          {/* Dialog Header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-border/30">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20">
                <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
              </div>
              <div>
                <Dialog.Title className="text-lg font-semibold text-foreground">Settings</Dialog.Title>
                <Dialog.Description className="text-xs text-muted-foreground">Configure your Vibe Coder</Dialog.Description>
              </div>
            </div>
            <Dialog.Close asChild>
              <button className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </Dialog.Close>
          </div>

          {/* Dialog Content */}
          <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto">
            {/* API Key Section */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                </svg>
                <label className="text-sm font-medium text-foreground" htmlFor="openrouter-key">OpenRouter API Key</label>
              </div>
              <div className="bg-[#363638] rounded-xl p-4">
                <input
                  id="openrouter-key"
                  type="password"
                  placeholder="sk-or-v1-..."
                  value={openrouterApiKey}
                  onChange={(event) => setSettings({ openrouterApiKey: event.target.value })}
                  className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
                />
              </div>
              <a href="https://openrouter.ai/keys" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-primary hover:underline">
                Get your API key
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            </div>

            {/* E2B API Key */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                </svg>
                <label className="text-sm font-medium text-foreground" htmlFor="e2b-key">E2B API Key</label>
              </div>
              <div className="bg-[#363638] rounded-xl p-4">
                <input
                  id="e2b-key"
                  type="password"
                  placeholder="E2B API key"
                  autoComplete="off"
                  value={e2bApiKey}
                  onChange={(event) => setSettings({ e2bApiKey: event.target.value })}
                  className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
                />
              </div>
            </div>

            {/* Template ID */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                </svg>
                <label className="text-sm font-medium text-foreground" htmlFor="template-id">Custom E2B Template ID</label>
              </div>
              <div className="bg-[#363638] rounded-xl p-4">
                <input
                  id="template-id"
                  placeholder="Optional template ID"
                  value={templateId}
                  onChange={(event) => setSettings({ templateId: event.target.value })}
                  className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
                />
              </div>
            </div>

            {/* Model Selection */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <label className="text-sm font-medium text-foreground">Select Model</label>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleLoadModels}
                  disabled={!openrouterApiKey}
                  className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium shadow-md shadow-primary/20 hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/30 transition-all duration-200 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Fetch Models
                </button>
                <div className="flex-1 relative">
                  <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input
                    ref={searchRef}
                    type="text"
                    placeholder="Search models..."
                    value={modelSearch}
                    onChange={(e) => setModelSearch(e.target.value)}
                    className="w-full bg-[#363638] rounded-lg pl-10 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
              </div>

              {modelStatus && (
                <p className="text-xs text-muted-foreground">{modelStatus}</p>
              )}

              <div className="bg-[#363638] rounded-xl max-h-[280px] overflow-y-auto p-2 space-y-1">
                {shownModels.length === 0 ? (
                  <p className="text-xs text-muted-foreground p-3 text-center">No models loaded. Click "Fetch Models" to load models from OpenRouter.</p>
                ) : (
                  shownModels.map((model) => (
                    <button
                      key={model.id}
                      type="button"
                      onClick={() => setSettings({ selectedModel: model.id })}
                      className={`w-full flex items-center justify-between p-3 rounded-xl cursor-pointer transition-colors text-left ${
                        selectedModel === model.id
                          ? 'bg-primary/15 border border-primary/30'
                          : 'hover:bg-white/5'
                      }`}
                    >
                      <div className="min-w-0">
                        <div className="text-sm font-medium text-foreground truncate">{model.name || model.id}</div>
                        <div className="text-[10px] text-muted-foreground truncate">{model.id}</div>
                      </div>
                      {selectedModel === model.id && (
                        <svg className="w-5 h-5 text-primary shrink-0 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Dialog Footer */}
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-border/30 bg-[#252525]">
            <Dialog.Close asChild>
              <button className="px-4 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors" type="button">
                Cancel
              </button>
            </Dialog.Close>
            <Dialog.Close asChild>
              <button className="px-5 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium shadow-md shadow-primary/20 hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/30 transition-all duration-200 active:scale-[0.98]" type="button">
                Save Changes
              </button>
            </Dialog.Close>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

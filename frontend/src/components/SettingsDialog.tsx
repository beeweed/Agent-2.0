import { useMemo, useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import * as Select from '@radix-ui/react-select';
import * as Separator from '@radix-ui/react-separator';
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
  const toolCapableModels = useMemo(() => models.filter((model) => model.supports_tools), [models]);
  const shownModels = toolCapableModels.length > 0 ? toolCapableModels : models;

  async function handleLoadModels() {
    try {
      setModelStatus('Loading OpenRouter models...');
      const result = await fetchModels(openrouterApiKey);
      setModels(result);
      const firstToolModel = result.find((model) => model.supports_tools) ?? result[0];
      if (firstToolModel && !selectedModel) {
        setSettings({ selectedModel: firstToolModel.id });
      }
      setModelStatus(`Loaded ${result.length} models${toolCapableModels.length ? ` (${toolCapableModels.length} with tool support)` : ''}.`);
    } catch (error) {
      setModelStatus(error instanceof Error ? error.message : 'Failed to load models.');
    }
  }

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <button className="button button-secondary" type="button">Settings</button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="dialog-overlay" />
        <Dialog.Content className="dialog-content">
          <Dialog.Title className="dialog-title">Agent Settings</Dialog.Title>
          <Dialog.Description className="dialog-description">
            Add provider credentials, load OpenRouter models, and optionally set a custom E2B template id.
          </Dialog.Description>

          <form className="settings-form" onSubmit={(event) => event.preventDefault()}>
            <label className="field-label" htmlFor="openrouter-key">OpenRouter API key</label>
            <input
              id="openrouter-key"
              className="input"
              type="password"
              autoComplete="off"
              value={openrouterApiKey}
              onChange={(event) => setSettings({ openrouterApiKey: event.target.value })}
              placeholder="sk-or-v1-..."
            />

            <label className="field-label" htmlFor="e2b-key">E2B sandbox API key</label>
            <input
              id="e2b-key"
              className="input"
              type="password"
              autoComplete="off"
              value={e2bApiKey}
              onChange={(event) => setSettings({ e2bApiKey: event.target.value })}
              placeholder="E2B API key"
            />

            <label className="field-label" htmlFor="template-id">Custom E2B template id</label>
            <input
              id="template-id"
              className="input"
              value={templateId}
              onChange={(event) => setSettings({ templateId: event.target.value })}
              placeholder="Optional template id"
            />

            <div className="settings-row">
              <button className="button" type="button" onClick={handleLoadModels} disabled={!openrouterApiKey}>
                Fetch OpenRouter models
              </button>
              <span className="settings-status">{modelStatus}</span>
            </div>

            <label className="field-label">Model</label>
            <Select.Root value={selectedModel} onValueChange={(value) => setSettings({ selectedModel: value })}>
              <Select.Trigger className="select-trigger" aria-label="Select model">
                <Select.Value placeholder="Select a model" />
              </Select.Trigger>
              <Select.Portal>
                <Select.Content className="select-content" position="popper">
                  <Select.Viewport className="select-viewport">
                    {shownModels.map((model) => (
                      <Select.Item className="select-item" value={model.id} key={model.id}>
                        <Select.ItemText>{model.name || model.id}</Select.ItemText>
                      </Select.Item>
                    ))}
                  </Select.Viewport>
                </Select.Content>
              </Select.Portal>
            </Select.Root>
          </form>

          <Separator.Root className="separator" />
          <footer className="dialog-actions">
            <Dialog.Close asChild>
              <button className="button button-secondary" type="button">Close</button>
            </Dialog.Close>
          </footer>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

import * as Tooltip from '@radix-ui/react-tooltip';
import { ChatPanel } from './components/ChatPanel';
import { FileExplorer } from './components/FileExplorer';
import { SettingsDialog } from './components/SettingsDialog';
import { useAppStore } from './store/useAppStore';

export default function App() {
  const iteration = useAppStore((state) => state.iteration);
  const maxIterations = useAppStore((state) => state.maxIterations);
  const fileTree = useAppStore((state) => state.fileTree);
  const selectedModel = useAppStore((state) => state.selectedModel);
  const sessionId = useAppStore((state) => state.sessionId);

  return (
    <Tooltip.Provider>
      <main className="app-shell">
        <header className="top-bar">
          <section className="brand-block" aria-label="Application identity">
            <span className="brand-mark" aria-hidden="true" />
            <div>
              <strong>E2B Native Tool Agent</strong>
              <span>FastAPI + React + OpenRouter</span>
            </div>
          </section>
          <section className="runtime-strip" aria-label="Runtime state">
            <Tooltip.Root>
              <Tooltip.Trigger asChild>
                <span className="metric-pill">Iteration {iteration}/{maxIterations}</span>
              </Tooltip.Trigger>
              <Tooltip.Portal>
                <Tooltip.Content className="tooltip-content">Resets on every user message. Max iteration limit is 1000.</Tooltip.Content>
              </Tooltip.Portal>
            </Tooltip.Root>
            <span className="metric-pill model-pill" title={selectedModel || 'No model selected'}>
              {selectedModel || 'No model selected'}
            </span>
            <span className="metric-pill session-pill" title={sessionId || 'No sandbox'}>
              {sessionId ? 'Sandbox ready' : 'No sandbox'}
            </span>
            <SettingsDialog />
          </section>
        </header>

        <section className="workspace">
          <ChatPanel />
          <FileExplorer tree={fileTree} />
        </section>
      </main>
    </Tooltip.Provider>
  );
}

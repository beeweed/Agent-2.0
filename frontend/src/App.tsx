import { useEffect, useState } from 'react';
import { cn } from './utils';
import { useAppStore } from './store/useAppStore';
import { ChatPanel } from './components/ChatPanel';
import { FileExplorer } from './components/FileExplorer';
import { SettingsDialog } from './components/SettingsDialog';
import { MemorySidebar } from './components/MemorySidebar';
import { Toast } from './components/Toast';
import { CodeEditor } from './components/CodeEditor';

type WorkspacePanel = 'chat' | 'files' | 'editor';

const panelOptions: Array<{ id: WorkspacePanel; label: string }> = [
  { id: 'chat', label: 'Chat' },
  { id: 'files', label: 'Files' },
  { id: 'editor', label: 'Editor' },
];

interface ShellHeaderProps {
  title: string;
  subtitle: string;
  panel?: WorkspacePanel;
}

function ShellHeader({ title, subtitle, panel }: ShellHeaderProps) {
  const selectedFilePath = useAppStore((state) => state.selectedFilePath);
  const setMemoryOpen = useAppStore((state) => state.setMemoryOpen);

  const helperText =
    panel === 'editor'
      ? selectedFilePath || 'Open a file from the explorer to inspect its content.'
      : subtitle;

  return (
    <div className="flex items-start justify-between gap-3 border-b border-border/30 bg-[#252525] px-4 py-3 sm:px-5">
      <div className="min-w-0">
        <h2 className="text-sm font-semibold text-foreground">{title}</h2>
        <p className="mt-1 truncate text-xs text-muted-foreground">{helperText}</p>
      </div>
      <div className="flex shrink-0 items-center gap-1.5">
        <button
          type="button"
          onClick={() => setMemoryOpen(true)}
          className="rounded-xl p-2.5 text-muted-foreground transition-all duration-200 hover:bg-white/5 hover:text-foreground"
          aria-label="Open memory sidebar"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
        </button>
        <SettingsDialog />
      </div>
    </div>
  );
}

export default function App() {
  const fileTree = useAppStore((state) => state.fileTree);
  const memoryOpen = useAppStore((state) => state.memoryOpen);
  const selectedFilePath = useAppStore((state) => state.selectedFilePath);
  const [mobilePanel, setMobilePanel] = useState<WorkspacePanel>('chat');
  const [tabletPanel, setTabletPanel] = useState<Exclude<WorkspacePanel, 'chat'>>('files');

  useEffect(() => {
    if (!selectedFilePath) {
      return;
    }

    setMobilePanel((current) => (current === 'files' ? 'editor' : current));
    setTabletPanel((current) => (current === 'files' ? 'editor' : current));
  }, [selectedFilePath]);

  return (
    <div id="app" className="h-[100dvh] w-full overflow-hidden bg-[#272727] text-foreground">
      <div className="hidden h-full bg-[#191919] xl:flex">
        <div className="w-[clamp(360px,34vw,500px)] shrink-0">
          <ChatPanel />
        </div>

        <div className="flex h-full min-w-0 flex-1">
          <FileExplorer tree={fileTree} />
          <CodeEditor />
        </div>
      </div>

      <div className="hidden h-full bg-[#191919] p-3 md:flex xl:hidden">
        <div className="flex min-w-0 flex-1 gap-3">
          <div className="w-[min(45%,420px)] min-w-[320px] shrink-0">
            <ChatPanel />
          </div>

          <div className="flex min-w-0 flex-1 flex-col overflow-hidden rounded-3xl border border-white/5 bg-[#1e1e1e]">
            <ShellHeader
              title="Workspace"
              subtitle="Switch between your sandbox files and the active editor without squeezing the layout."
              panel={tabletPanel}
            />

            <div className="border-b border-border/20 bg-[#202020] px-3 py-2">
              <div className="inline-flex rounded-2xl bg-white/5 p-1">
                <button
                  type="button"
                  onClick={() => setTabletPanel('files')}
                  className={cn(
                    'rounded-xl px-4 py-2 text-sm font-medium transition-colors',
                    tabletPanel === 'files'
                      ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20'
                      : 'text-muted-foreground hover:text-foreground',
                  )}
                >
                  Files
                </button>
                <button
                  type="button"
                  onClick={() => setTabletPanel('editor')}
                  className={cn(
                    'rounded-xl px-4 py-2 text-sm font-medium transition-colors',
                    tabletPanel === 'editor'
                      ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20'
                      : 'text-muted-foreground hover:text-foreground',
                  )}
                >
                  Editor
                </button>
              </div>
            </div>

            <div className="min-h-0 flex-1">
              {tabletPanel === 'files' ? (
                <FileExplorer tree={fileTree} fullWidth hideFooter />
              ) : (
                <CodeEditor />
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="flex h-full flex-col bg-[#191919] md:hidden">
        <div className="min-h-0 flex-1 px-2 pt-2">
          {mobilePanel === 'chat' ? (
            <ChatPanel />
          ) : mobilePanel === 'files' ? (
            <div className="flex h-full min-h-0 flex-col overflow-hidden rounded-[28px] border border-white/5 bg-[#1e1e1e]">
              <ShellHeader
                title="Files"
                subtitle="Browse the live sandbox tree and open any file for review."
                panel="files"
              />
              <div className="min-h-0 flex-1">
                <FileExplorer tree={fileTree} fullWidth hideFooter />
              </div>
            </div>
          ) : (
            <div className="flex h-full min-h-0 flex-col overflow-hidden rounded-[28px] border border-white/5 bg-[#1e1e1e]">
              <ShellHeader
                title="Editor"
                subtitle="Read generated file contents with a layout that fits smaller screens."
                panel="editor"
              />
              <div className="min-h-0 flex-1">
                <CodeEditor />
              </div>
            </div>
          )}
        </div>

        <div className="border-t border-border/30 bg-[#232323]/95 px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2 backdrop-blur">
          <div className="grid grid-cols-3 gap-2">
            {panelOptions.map((panel) => {
              const active = mobilePanel === panel.id;
              return (
                <button
                  key={panel.id}
                  type="button"
                  onClick={() => setMobilePanel(panel.id)}
                  className={cn(
                    'flex min-h-[52px] flex-col items-center justify-center gap-1 rounded-2xl px-3 py-2 text-xs font-medium transition-all',
                    active
                      ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20'
                      : 'bg-white/5 text-muted-foreground hover:bg-white/10 hover:text-foreground',
                  )}
                >
                  <span>{panel.label}</span>
                  {panel.id === 'editor' && selectedFilePath ? (
                    <span className="max-w-full truncate text-[10px] opacity-80">{selectedFilePath.split('/').pop()}</span>
                  ) : null}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {memoryOpen && <MemorySidebar />}
      <Toast />
    </div>
  );
}
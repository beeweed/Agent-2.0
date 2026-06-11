import { useAppStore } from './store/useAppStore';
import { ChatPanel } from './components/ChatPanel';
import { FileExplorer } from './components/FileExplorer';
import { SettingsDialog } from './components/SettingsDialog';
import { MemorySidebar } from './components/MemorySidebar';
import { Toast } from './components/Toast';
import { CodeEditor } from './components/CodeEditor';

export default function App() {
  const fileTree = useAppStore((state) => state.fileTree);
  const memoryOpen = useAppStore((state) => state.memoryOpen);
  const selectedFilePath = useAppStore((state) => state.selectedFilePath);

  return (
    <div id="app" className="h-screen w-screen overflow-hidden bg-[#272727]">
      {/* Desktop Layout */}
      <div className="hidden md:flex h-full bg-[#191919]">
        {/* LEFT SIDE: CHAT PANEL */}
        <div className="w-[440px] min-w-[380px] max-w-[520px] shrink-0 lg:w-[40%]">
          <ChatPanel />
        </div>

        {/* RIGHT SIDE: FILE PANEL */}
        <div className="flex-1 min-w-0 flex h-full">
          <FileExplorer tree={fileTree} />
          <CodeEditor />
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="md:hidden flex flex-col h-full">
        <div className="flex-1 bg-[#1e1e1e] flex items-center justify-center">
          <div className="text-center p-8">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
              <svg className="w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-foreground mb-2">Mobile View</h2>
            <p className="text-sm text-muted-foreground">Resize window to see desktop layout</p>
          </div>
        </div>
        <div className="flex h-14 bg-[#232323] border-t border-border/30">
          <button className="flex-1 flex items-center justify-center gap-2 text-primary bg-primary/10">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <span className="text-sm font-medium">Chat</span>
          </button>
          <button className="flex-1 flex items-center justify-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
            </svg>
            <span className="text-sm font-medium">Files</span>
          </button>
        </div>
      </div>

      {/* Settings Dialog */}
      <SettingsDialog />

      {/* Memory Sidebar */}
      {memoryOpen && <MemorySidebar />}

      {/* Toast */}
      <Toast />
    </div>
  );
}

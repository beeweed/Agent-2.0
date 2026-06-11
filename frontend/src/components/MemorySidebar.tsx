import { useAppStore } from '../store/useAppStore';

export function MemorySidebar() {
  const setMemoryOpen = useAppStore((state) => state.setMemoryOpen);
  const iteration = useAppStore((state) => state.iteration);
  const maxIterations = useAppStore((state) => state.maxIterations);
  const fileTree = useAppStore((state) => state.fileTree);
  const toolActivities = useAppStore((state) => state.toolActivities);
  const messages = useAppStore((state) => state.messages);
  const sessionId = useAppStore((state) => state.sessionId);

  function countFiles(node: typeof fileTree): number {
    if (!node) return 0;
    if (node.type === 'file') return 1;
    return (node.children || []).reduce((sum, child) => sum + countFiles(child), 0);
  }

  const totalToolCalls = toolActivities.length;
  const totalFiles = countFiles(fileTree);
  const totalIterations = iteration;
  const contextSize = messages.reduce((sum, m) => sum + m.content.length, 0);
  const contextK = Math.round(contextSize / 100) / 10;

  return (
    <div className="fixed inset-0 z-50">
      <div onClick={() => setMemoryOpen(false)} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div className="absolute right-0 top-0 h-full w-full sm:w-[420px] md:w-[480px] lg:w-[520px] bg-[#2d2d2d] shadow-2xl animate-slide-in-right overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-[#232323] px-4 sm:px-6 pt-4 sm:pt-6 pb-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20">
                <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <div>
                <h2 className="text-lg font-semibold text-foreground">Agent Memory</h2>
                <p className="text-xs text-muted-foreground">Session context & history</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setMemoryOpen(false)}
                className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 sm:p-4 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20">
              <div className="flex items-center gap-2 mb-1">
                <svg className="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <span className="text-[10px] font-medium text-primary uppercase tracking-wide">Iterations</span>
              </div>
              <div className="text-2xl font-bold text-foreground">{totalIterations}</div>
            </div>

            <div className="p-3 sm:p-4 rounded-xl bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 border border-emerald-500/20">
              <div className="flex items-center gap-2 mb-1">
                <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span className="text-[10px] font-medium text-emerald-400 uppercase tracking-wide">Files</span>
              </div>
              <div className="text-2xl font-bold text-foreground">{totalFiles}</div>
            </div>

            <div className="p-3 sm:p-4 rounded-xl bg-gradient-to-br from-blue-500/10 to-blue-600/5 border border-blue-500/20">
              <div className="flex items-center gap-2 mb-1">
                <svg className="w-4 h-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                </svg>
                <span className="text-[10px] font-medium text-blue-400 uppercase tracking-wide">Tool Calls</span>
              </div>
              <div className="text-2xl font-bold text-foreground">{totalToolCalls}</div>
            </div>

            <div className="p-3 sm:p-4 rounded-xl bg-gradient-to-br from-amber-500/10 to-amber-600/5 border border-amber-500/20">
              <div className="flex items-center gap-2 mb-1">
                <svg className="w-4 h-4 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                <span className="text-[10px] font-medium text-amber-400 uppercase tracking-wide">Context</span>
              </div>
              <div className="text-2xl font-bold text-foreground">{contextK}K</div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {/* Context Overview Card */}
          <div className="rounded-xl bg-[#363638] border border-border/30 overflow-hidden">
            <div className="px-4 py-3 bg-[#2a2a2c] border-b border-border/30">
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                <span className="text-sm font-medium text-foreground">Context Overview</span>
              </div>
            </div>
            <div className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-400" />
                  <span className="text-xs text-muted-foreground">Messages</span>
                </div>
                <span className="text-xs font-medium text-foreground">{messages.length} messages</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-purple-400" />
                  <span className="text-xs text-muted-foreground">Files in tree</span>
                </div>
                <span className="text-xs font-medium text-foreground">{totalFiles} files</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-green-400" />
                  <span className="text-xs text-muted-foreground">Session active</span>
                </div>
                <span className="text-xs font-medium text-foreground">{sessionId ? 'Yes' : 'No'}</span>
              </div>
            </div>
          </div>

          {/* Timeline Entries */}
          <div className="space-y-2">
            {toolActivities.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-xs text-muted-foreground">No tool activity yet.</p>
              </div>
            ) : (
              toolActivities.slice().reverse().map((activity) => (
                <div key={activity.id} className="flex items-start gap-3 p-3 rounded-xl bg-[#363638] border border-border/30">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    activity.status === 'done'
                      ? 'bg-emerald-500/20'
                      : activity.status === 'error'
                        ? 'bg-red-500/20'
                        : 'bg-blue-500/20'
                  }`}>
                    {activity.status === 'done' ? (
                      <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    ) : activity.status === 'error' ? (
                      <svg className="w-4 h-4 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                      </svg>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-medium text-foreground">{activity.action}</span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                        activity.status === 'done'
                          ? 'bg-emerald-500/15 text-emerald-400'
                          : activity.status === 'error'
                            ? 'bg-red-500/15 text-red-400'
                            : 'bg-primary/15 text-primary animate-pulse'
                      }`}>
                        {activity.status}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground truncate">{activity.filePath || activity.name}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

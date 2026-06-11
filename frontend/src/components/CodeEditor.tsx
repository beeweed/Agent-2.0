import { useAppStore } from '../store/useAppStore';

export function CodeEditor() {
  const selectedFilePath = useAppStore((state) => state.selectedFilePath);
  const fileContents = useAppStore((state) => state.fileContents);
  const fileTree = useAppStore((state) => state.fileTree);

  const content = selectedFilePath ? fileContents[selectedFilePath] : null;
  const parts = selectedFilePath ? selectedFilePath.split('/') : [];
  const filename = parts[parts.length - 1] || '';
  const dirParts = parts.slice(0, -1);

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-[#1e1e1e]">
      {/* Editor Tabs Bar */}
      <div className="flex items-center h-10 bg-[#1e1e1e] border-b border-border/30 px-2 gap-1">
        {selectedFilePath ? (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-background border-t-2 border-t-primary rounded-t-lg">
            {filename.endsWith('.css') ? (
              <svg className="w-4 h-4 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            ) : (
              <svg className="w-4 h-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
            )}
            <span className="text-xs font-medium text-foreground">{filename}</span>
          </div>
        ) : (
          <div className="flex items-center gap-2 px-3 py-1.5 text-muted-foreground text-xs">
            No file selected
          </div>
        )}
      </div>

      {/* Breadcrumb */}
      <div className="flex items-center h-7 px-4 bg-[#1e1e1e] border-b border-border/20">
        <div className="flex items-center gap-1.5 text-[11px] font-mono text-muted-foreground">
          {dirParts.length > 0 ? (
            <>
              <span>{dirParts[0] || ''}</span>
              {dirParts.slice(0, -1).map((part, i) => (
                <span key={i} className="flex items-center gap-1.5">
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                  <span>{part}</span>
                </span>
              ))}
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </>
          ) : null}
          <span className="text-foreground">{filename || 'No file selected'}</span>
        </div>
      </div>

      {/* Code Content */}
      <div className="flex-1 overflow-auto p-6 font-mono text-[13px] leading-6">
        {content ? (
          <pre className="hljs"><code>{content}</code></pre>
        ) : selectedFilePath ? (
          <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
            <p>File content not available yet. File will appear here after being created.</p>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
            <svg className="w-12 h-12 mb-4 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
            </svg>
            <p className="text-sm">Select a file from the explorer to view its contents</p>
          </div>
        )}
      </div>

      {/* Status Bar */}
      {selectedFilePath && (
        <div className="flex items-center justify-between h-6 px-3 bg-[#232323] border-t border-border/30 text-[10px] text-muted-foreground">
          <div className="flex items-center gap-4">
            {filename.endsWith('.tsx') || filename.endsWith('.ts') ? (
              <span>TypeScript React</span>
            ) : filename.endsWith('.css') ? (
              <span>CSS</span>
            ) : (
              <span>Plain Text</span>
            )}
            <span>UTF-8</span>
          </div>
          <div className="flex items-center gap-4">
            <span>Ln 1, Col 1</span>
            <span>Spaces: 2</span>
          </div>
        </div>
      )}
    </div>
  );
}

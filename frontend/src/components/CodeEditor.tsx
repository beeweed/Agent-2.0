import { useAppStore } from '../store/useAppStore';

export function CodeEditor() {
  const selectedFilePath = useAppStore((state) => state.selectedFilePath);
  const fileContents = useAppStore((state) => state.fileContents);

  const content = selectedFilePath ? fileContents[selectedFilePath] : null;
  const parts = selectedFilePath ? selectedFilePath.split('/') : [];
  const filename = parts[parts.length - 1] || '';
  const dirParts = parts.slice(0, -1);

  return (
    <div className="flex h-full min-w-0 flex-1 flex-col bg-[#1e1e1e]">
      <div className="flex h-10 items-center gap-1 overflow-x-auto border-b border-border/30 bg-[#1e1e1e] px-2">
        {selectedFilePath ? (
          <div className="flex items-center gap-2 rounded-t-lg border-t-2 border-t-primary bg-background px-3 py-1.5">
            {filename.endsWith('.css') ? (
              <svg className="h-4 w-4 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            ) : (
              <svg className="h-4 w-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
            )}
            <span className="truncate text-xs font-medium text-foreground">{filename}</span>
          </div>
        ) : (
          <div className="px-3 py-1.5 text-xs text-muted-foreground">No file selected</div>
        )}
      </div>

      <div className="h-8 overflow-x-auto border-b border-border/20 bg-[#1e1e1e] px-4">
        <div className="flex h-full min-w-max items-center gap-1.5 text-[11px] font-mono text-muted-foreground">
          {dirParts.length > 0 ? (
            <>
              <span>{dirParts[0] || ''}</span>
              {dirParts.slice(0, -1).map((part, i) => (
                <span key={i} className="flex items-center gap-1.5">
                  <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                  <span>{part}</span>
                </span>
              ))}
              <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </>
          ) : null}
          <span className="text-foreground">{filename || 'No file selected'}</span>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-4 font-mono text-[12px] leading-5 sm:p-6 sm:text-[13px] sm:leading-6">
        {content ? (
          <pre className="hljs min-w-max"><code>{content}</code></pre>
        ) : selectedFilePath ? (
          <div className="flex h-full items-center justify-center text-center text-sm text-muted-foreground">
            <p>File content not available yet. File will appear here after being created.</p>
          </div>
        ) : (
          <div className="flex h-full flex-col items-center justify-center text-center text-muted-foreground">
            <svg className="mb-4 h-12 w-12 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
            </svg>
            <p className="text-sm">Select a file from the explorer to view its contents</p>
          </div>
        )}
      </div>

      {selectedFilePath && (
        <div className="flex flex-col gap-2 border-t border-border/30 bg-[#232323] px-3 py-2 text-[10px] text-muted-foreground sm:h-6 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:py-0">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
            {filename.endsWith('.tsx') || filename.endsWith('.ts') ? (
              <span>TypeScript React</span>
            ) : filename.endsWith('.css') ? (
              <span>CSS</span>
            ) : (
              <span>Plain Text</span>
            )}
            <span>UTF-8</span>
          </div>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
            <span>Ln 1, Col 1</span>
            <span>Spaces: 2</span>
          </div>
        </div>
      )}
    </div>
  );
}
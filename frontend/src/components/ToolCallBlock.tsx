import { useState } from 'react';
import type { ToolBlock } from '../types';

interface ToolCallBlockProps {
  block: ToolBlock;
}

export function ToolCallBlock({ block }: ToolCallBlockProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="rounded-xl bg-[#2d2d2f] border border-border/30 overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-[#363638] transition-colors"
      >
        <div className="w-6 h-6 rounded-md bg-blue-500/10 flex items-center justify-center">
          <svg className="w-3.5 h-3.5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
          </svg>
        </div>
        <span className="text-xs font-mono text-muted-foreground">{block.action}</span>
        <span className={`text-[10px] px-1.5 py-0.5 rounded ${
          block.status === 'done' ? 'bg-emerald-500/15 text-emerald-400' :
          block.status === 'error' ? 'bg-red-500/15 text-red-400' :
          'bg-primary/15 text-primary animate-pulse'
        }`}>
          {block.status}
        </span>
        <svg className={`w-4 h-4 text-muted-foreground ml-auto transition-transform ${expanded ? 'rotate-90' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>
      {expanded && block.content && (
        <div className="px-3 pb-3">
          <pre className="text-xs text-muted-foreground font-mono bg-[#1e1e1e] rounded-lg p-3 overflow-auto max-h-[200px] whitespace-pre-wrap">{block.content}</pre>
        </div>
      )}
    </div>
  );
}

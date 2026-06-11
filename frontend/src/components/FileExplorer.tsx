import { useState } from 'react';
import * as ScrollArea from '@radix-ui/react-scroll-area';
import type { FileNode } from '../types';
import { useAppStore } from '../store/useAppStore';
import { getFileIcon } from './FileIcon';

interface FileExplorerProps {
  tree: FileNode | null;
  fullWidth?: boolean;
  hideFooter?: boolean;
}

function FileTreeNode({ node, depth = 0 }: { node: FileNode; depth?: number }) {
  const [expanded, setExpanded] = useState(true);
  const selectedFilePath = useAppStore((state) => state.selectedFilePath);
  const setSelectedFilePath = useAppStore((state) => state.setSelectedFilePath);
  const isDirectory = node.type === 'directory';
  const isSelected = node.path === selectedFilePath;

  function handleClick() {
    if (isDirectory) {
      setExpanded(!expanded);
    } else {
      setSelectedFilePath(node.path);
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={handleClick}
        className={`mx-1 flex w-[calc(100%-0.5rem)] items-center gap-1.5 rounded-lg px-2 py-1.5 text-left transition-all duration-150 ${
          isSelected ? 'bg-primary/15 text-primary' : 'text-foreground hover:bg-white/5'
        }`}
        style={{ paddingLeft: `${depth * 14 + 8}px` }}
      >
        {isDirectory ? (
          <>
            <svg className="h-3 w-3 shrink-0 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={expanded ? 'M19 9l-7 7-7-7' : 'M9 5l7 7-7 7'} />
            </svg>
            <svg className="h-4 w-4 shrink-0 text-yellow-500" fill="currentColor" viewBox="0 0 24 24">
              <path d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z" />
            </svg>
          </>
        ) : (
          <>
            <div className="h-3 w-3 shrink-0" />
            {getFileIcon(node.name)}
          </>
        )}
        <span className="truncate text-[13px]">{node.name}</span>
      </button>
      {isDirectory && node.children?.length && expanded && (
        <div>
          {node.children.map((child) => (
            <FileTreeNode key={child.path} node={child} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

export function FileExplorer({ tree, fullWidth = false, hideFooter = false }: FileExplorerProps) {
  return (
    <div
      className={`flex h-full min-w-0 flex-col bg-[#232323] ${
        fullWidth ? 'w-full border-r-0' : 'w-56 shrink-0 border-r border-border/30 lg:w-64'
      }`}
    >
      <div className="flex items-center justify-between border-b border-border/50 px-3 py-3">
        <div className="flex items-center gap-2">
          <svg className="h-4 w-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
          </svg>
          <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Explorer</span>
        </div>
      </div>

      <ScrollArea.Root className="flex-1 overflow-hidden">
        <ScrollArea.Viewport className="h-full w-full">
          <div className="py-2">
            {tree ? (
              <FileTreeNode node={tree} />
            ) : (
              <div className="px-4 py-8 text-center">
                <p className="text-xs text-muted-foreground">No sandbox files yet.</p>
              </div>
            )}
          </div>
        </ScrollArea.Viewport>
        <ScrollArea.Scrollbar className="w-2 p-0.5" orientation="vertical">
          <ScrollArea.Thumb className="rounded-full bg-white/10 transition-colors hover:bg-white/20" />
        </ScrollArea.Scrollbar>
      </ScrollArea.Root>

      {!hideFooter ? (
        <div className="border-t border-border/30 p-2">
          <button
            type="button"
            className="flex w-full items-center justify-center gap-2 rounded-lg px-3 py-2 text-xs text-muted-foreground transition-colors hover:bg-white/5 hover:text-foreground"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span>Collapse</span>
          </button>
        </div>
      ) : null}
    </div>
  );
}
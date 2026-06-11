import { useState } from 'react';
import * as ScrollArea from '@radix-ui/react-scroll-area';
import type { FileNode } from '../types';
import { useAppStore } from '../store/useAppStore';
import { getFileIcon } from './FileIcon';

interface FileExplorerProps {
  tree: FileNode | null;
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
      <div
        onClick={handleClick}
        className={`flex items-center gap-1.5 px-2 py-1.5 cursor-pointer transition-all duration-150 rounded-lg mx-1 ${
          isSelected
            ? 'bg-primary/15 text-primary'
            : 'hover:bg-white/5 text-foreground'
        }`}
        style={{ paddingLeft: `${depth * 14 + 8}px` }}
      >
        {isDirectory ? (
          <>
            <svg className="w-3 h-3 text-muted-foreground shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={expanded ? "M19 9l-7 7-7-7" : "M9 5l7 7-7 7"} />
            </svg>
            <svg className="w-4 h-4 text-yellow-500 shrink-0" fill="currentColor" viewBox="0 0 24 24">
              <path d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z" />
            </svg>
          </>
        ) : (
          <>
            <div className="w-3 h-3 shrink-0" />
            {getFileIcon(node.name)}
          </>
        )}
        <span className="text-[13px] truncate">{node.name}</span>
      </div>
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

export function FileExplorer({ tree }: FileExplorerProps) {
  return (
    <div className="w-56 lg:w-64 bg-[#232323] border-r border-border/30 flex flex-col shrink-0">
      {/* Sidebar Header */}
      <div className="flex items-center justify-between px-3 py-3 border-b border-border/50">
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
          </svg>
          <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Explorer</span>
        </div>
      </div>

      {/* File Tree */}
      <ScrollArea.Root className="flex-1 overflow-hidden">
        <ScrollArea.Viewport className="w-full h-full">
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
          <ScrollArea.Thumb className="bg-white/10 rounded-full hover:bg-white/20 transition-colors" />
        </ScrollArea.Scrollbar>
      </ScrollArea.Root>

      {/* Collapse Button */}
      <div className="p-2 border-t border-border/30">
        <button className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span>Collapse</span>
        </button>
      </div>
    </div>
  );
}

import * as ScrollArea from '@radix-ui/react-scroll-area';
import type { FileNode } from '../types';

interface FileExplorerProps {
  tree: FileNode | null;
}

function FileTreeNode({ node, depth = 0 }: { node: FileNode; depth?: number }) {
  const isDirectory = node.type === 'directory';
  return (
    <li className="file-node">
      <section className="file-node-row" style={{ paddingLeft: `${depth * 14 + 10}px` }} title={node.path}>
        <span className={`file-node-glyph ${isDirectory ? 'directory' : 'file'}`} aria-hidden="true" />
        <span className="file-node-name">{node.name}</span>
      </section>
      {isDirectory && node.children?.length ? (
        <ul className="file-node-children">
          {node.children.map((child) => (
            <FileTreeNode key={child.path} node={child} depth={depth + 1} />
          ))}
        </ul>
      ) : null}
    </li>
  );
}

export function FileExplorer({ tree }: FileExplorerProps) {
  return (
    <aside className="file-explorer" aria-label="Sandbox file explorer">
      <header className="panel-header">
        <div>
          <p className="eyebrow">Sandbox</p>
          <h2>Files</h2>
        </div>
      </header>
      <ScrollArea.Root className="scroll-root">
        <ScrollArea.Viewport className="scroll-viewport">
          {tree ? (
            <nav className="file-tree" aria-label="Generated files">
              <ul>
                <FileTreeNode node={tree} />
              </ul>
            </nav>
          ) : (
            <section className="empty-panel">
              <p>No sandbox files yet.</p>
              <span>Ask the agent to create or read files and the tree will update here.</span>
            </section>
          )}
        </ScrollArea.Viewport>
        <ScrollArea.Scrollbar className="scrollbar" orientation="vertical">
          <ScrollArea.Thumb className="scrollbar-thumb" />
        </ScrollArea.Scrollbar>
      </ScrollArea.Root>
    </aside>
  );
}

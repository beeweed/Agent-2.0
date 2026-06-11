import { FormEvent, useEffect, useRef, useState } from 'react';
import * as ScrollArea from '@radix-ui/react-scroll-area';
import { useChatStream } from '../hooks/useChatStream';
import { useAppStore } from '../store/useAppStore';
import { ThinkingIndicator } from './ThinkingIndicator';
import { ToolChip } from './ToolChip';
import { FileCard } from './FileCard';
import { SettingsDialog } from './SettingsDialog';

export function ChatPanel() {
  const [input, setInput] = useState('');
  const messages = useAppStore((state) => state.messages);
  const statusText = useAppStore((state) => state.statusText);
  const isStreaming = useAppStore((state) => state.isStreaming);
  const error = useAppStore((state) => state.error);
  const iteration = useAppStore((state) => state.iteration);
  const maxIterations = useAppStore((state) => state.maxIterations);
  const selectedModel = useAppStore((state) => state.selectedModel);
  const resetConversation = useAppStore((state) => state.resetConversation);
  const setMemoryOpen = useAppStore((state) => state.setMemoryOpen);
  const { sendMessage } = useChatStream();
  const viewportRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    viewportRef.current?.scrollTo({ top: viewportRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, statusText]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const value = input;
    setInput('');
    await sendMessage(value);
  }

  return (
    <div className="m-2 flex h-[calc(100%-0.5rem)] flex-col overflow-hidden rounded-[28px] border border-white/5 bg-[#1e1e1e] sm:m-3 sm:h-[calc(100%-1.5rem)] sm:rounded-3xl">
      <div className="flex items-center justify-between border-b border-border/30 bg-[#252525] px-4 py-4 sm:px-5">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary/60 shadow-lg shadow-primary/20">
            <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
            </svg>
          </div>
          <div className="min-w-0">
            <h1 className="truncate text-sm font-semibold text-foreground">Vibe Coder</h1>
            <p className="truncate text-[11px] text-muted-foreground">
              {selectedModel ? `Model: ${selectedModel}` : 'Autonomous AI Agent'}
            </p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-1">
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
          <button
            type="button"
            onClick={resetConversation}
            className="rounded-xl p-2.5 text-muted-foreground transition-all duration-200 hover:bg-white/5 hover:text-foreground"
            aria-label="Reset conversation"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
          <SettingsDialog />
        </div>
      </div>

      <ScrollArea.Root className="flex-1 overflow-hidden">
        <ScrollArea.Viewport ref={viewportRef} className="h-full w-full">
          <div className="space-y-4 p-4 sm:p-5">
            {messages.length === 0 ? (
              <div className="flex min-h-[260px] h-full items-center justify-center sm:min-h-[300px]">
                <div className="text-center">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20">
                    <svg className="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                    </svg>
                  </div>
                  <h2 className="mb-2 text-lg font-semibold text-foreground">Welcome to Vibe Coder</h2>
                  <p className="mx-auto max-w-md text-sm text-muted-foreground">
                    Describe what you want to build, and I&apos;ll create it for you.
                  </p>
                </div>
              </div>
            ) : null}

            {messages.map((message) => (
              <div key={message.id}>
                {message.role === 'user' ? (
                  <div className="flex justify-end gap-3 animate-fade-in">
                    <div className="max-w-[92%] rounded-2xl rounded-tr-md bg-primary px-4 py-3 text-primary-foreground shadow-lg shadow-primary/10 sm:max-w-[85%]">
                      <p className="text-sm">{message.blocks.map((b) => (b.type === 'text' ? b.content : '')).join('')}</p>
                    </div>
                    <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl bg-primary/20">
                      <svg className="h-4 w-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                  </div>
                ) : (
                  <div className="flex gap-3 animate-fade-in">
                    <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-primary/20 to-accent/20">
                      <svg className="h-4 w-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                      </svg>
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="mb-2 block text-xs font-medium text-muted-foreground">Vibe Coder</span>

                      {iteration > 0 && (
                        <div className="mb-3 inline-flex items-center gap-1.5 rounded-lg border border-primary/20 bg-primary/10 px-2 py-1">
                          <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary"></div>
                          <span className="text-[10px] font-medium text-primary">Iteration {iteration}/{maxIterations}</span>
                        </div>
                      )}

                      {message.blocks.map((block, blockIndex) => {
                        if (block.type === 'text' && block.content) {
                          return (
                            <div key={`text-${blockIndex}`} className="mb-3 whitespace-pre-wrap text-sm leading-relaxed text-foreground/90">
                              {block.content}
                            </div>
                          );
                        }
                        if (block.type === 'tool') {
                          if (block.status === 'running') {
                            return (
                              <div key={block.id} className="mb-3">
                                <FileCard path={block.filePath} status="writing" description={block.name} />
                              </div>
                            );
                          }
                          if (block.status === 'done') {
                            return (
                              <div key={block.id} className="mb-3">
                                <FileCard path={block.filePath} status="created" description={block.name} />
                              </div>
                            );
                          }
                          if (block.status === 'error') {
                            return (
                              <div key={block.id} className="mb-3">
                                <ToolChip block={block} />
                              </div>
                            );
                          }
                        }
                        return null;
                      })}

                      {error && (
                        <div className="mt-3 rounded-xl border border-red-500/30 bg-red-500/10 p-4">
                          <p className="text-sm text-red-400">{error}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}

            <ThinkingIndicator text={statusText} />
          </div>
        </ScrollArea.Viewport>
        <ScrollArea.Scrollbar className="w-2 p-0.5" orientation="vertical">
          <ScrollArea.Thumb className="rounded-full bg-white/10 transition-colors hover:bg-white/20" />
        </ScrollArea.Scrollbar>
      </ScrollArea.Root>

      <div className="border-t border-border/30 bg-[#252525] p-3 sm:p-4">
        <form className="relative" onSubmit={handleSubmit}>
          <textarea
            placeholder="Describe what you want to build..."
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault();
                event.currentTarget.form?.requestSubmit();
              }
            }}
            className="w-full min-h-[84px] max-h-[200px] rounded-2xl border border-transparent bg-[#323234] px-4 py-4 pr-14 text-sm text-foreground placeholder:text-muted-foreground transition-all focus:border-primary/30 focus:outline-none focus:ring-2 focus:ring-primary/50 sm:min-h-[100px]"
            rows={3}
            disabled={isStreaming}
          />
          <button
            type="submit"
            disabled={isStreaming || !input.trim()}
            className="absolute bottom-3 right-3 flex h-10 w-10 items-center justify-center rounded-xl bg-primary shadow-md shadow-primary/20 transition-all duration-200 hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/30 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
}
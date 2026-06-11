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
  const sessionId = useAppStore((state) => state.sessionId);
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
    <div className="flex flex-col h-full m-3 rounded-3xl border border-white/5 overflow-hidden bg-[#1e1e1e]">
      {/* Chat Header */}
      <div className="flex items-center justify-between px-5 py-4 bg-[#252525] border-b border-border/30">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shadow-lg shadow-primary/20">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
            </svg>
          </div>
          <div>
            <h1 className="text-sm font-semibold text-foreground">Vibe Coder</h1>
            <p className="text-[11px] text-muted-foreground">Autonomous AI Agent</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setMemoryOpen(true)}
            className="p-2.5 rounded-xl text-muted-foreground hover:text-foreground hover:bg-white/5 transition-all duration-200"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </button>
          <button
            onClick={resetConversation}
            className="p-2.5 rounded-xl text-muted-foreground hover:text-foreground hover:bg-white/5 transition-all duration-200"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
          <SettingsDialog />
        </div>
      </div>

      {/* Messages Area */}
      <ScrollArea.Root className="flex-1 overflow-hidden">
        <ScrollArea.Viewport ref={viewportRef} className="w-full h-full">
          <div className="p-5 space-y-4">
            {messages.length === 0 ? (
              <div className="flex items-center justify-center h-full min-h-[300px]">
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                    <svg className="w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                    </svg>
                  </div>
                  <h2 className="text-lg font-semibold text-foreground mb-2">Welcome to Vibe Coder</h2>
                  <p className="text-sm text-muted-foreground max-w-md">Describe what you want to build, and I'll create it for you.</p>
                </div>
              </div>
            ) : null}

            {messages.map((message) => (
              <div key={message.id}>
                {message.role === 'user' ? (
                  <div className="flex gap-3 justify-end animate-fade-in">
                    <div className="max-w-[85%] px-4 py-3 rounded-2xl rounded-tr-md bg-primary text-primary-foreground shadow-lg shadow-primary/10">
                      <p className="text-sm">{message.blocks.map((b) => (b.type === 'text' ? b.content : '')).join('')}</p>
                    </div>
                    <div className="w-8 h-8 rounded-xl bg-primary/20 flex items-center justify-center flex-shrink-0">
                      <svg className="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                  </div>
                ) : (
                  <div className="flex gap-3 animate-fade-in">
                    <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center flex-shrink-0">
                      <svg className="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-xs font-medium text-muted-foreground mb-2 block">Vibe Coder</span>

                      {/* Iteration Badge */}
                      {iteration > 0 && (
                        <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg bg-primary/10 border border-primary/20 mb-3">
                          <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></div>
                          <span className="text-[10px] font-medium text-primary">Iteration {iteration}/{maxIterations}</span>
                        </div>
                      )}

                      {/* Blocks rendered in chronological order */}
                      {message.blocks.map((block, blockIndex) => {
                        if (block.type === 'text' && block.content) {
                          return (
                            <div key={`text-${blockIndex}`} className="text-sm leading-relaxed text-foreground/90 mb-3 whitespace-pre-wrap">
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

                      {/* Error Banner */}
                      {error && (
                        <div className="rounded-xl bg-red-500/10 border border-red-500/30 p-4 mt-3">
                          <p className="text-sm text-red-400">{error}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}

            {/* Thinking Indicator — after all messages */}
            <ThinkingIndicator text={statusText} />
          </div>
        </ScrollArea.Viewport>
        <ScrollArea.Scrollbar className="w-2 p-0.5" orientation="vertical">
          <ScrollArea.Thumb className="bg-white/10 rounded-full hover:bg-white/20 transition-colors" />
        </ScrollArea.Scrollbar>
      </ScrollArea.Root>

      {/* Input Area */}
      <div className="p-4 bg-[#252525] border-t border-border/30">
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
            className="w-full min-h-[100px] max-h-[200px] bg-[#323234] rounded-2xl px-4 py-4 pr-14 text-sm text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-2 focus:ring-primary/50 border border-transparent focus:border-primary/30 transition-all"
            rows={3}
            disabled={isStreaming}
          />
          <button
            type="submit"
            disabled={isStreaming || !input.trim()}
            className="absolute bottom-3 right-3 h-10 w-10 rounded-xl bg-primary hover:bg-primary/90 flex items-center justify-center shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30 transition-all duration-200 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
}

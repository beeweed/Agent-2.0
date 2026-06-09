import { FormEvent, useEffect, useRef, useState } from 'react';
import * as ScrollArea from '@radix-ui/react-scroll-area';
import { useChatStream } from '../hooks/useChatStream';
import { useAppStore } from '../store/useAppStore';
import { ThinkingIndicator } from './ThinkingIndicator';
import { ToolChip } from './ToolChip';

export function ChatPanel() {
  const [input, setInput] = useState('');
  const messages = useAppStore((state) => state.messages);
  const toolActivities = useAppStore((state) => state.toolActivities);
  const statusText = useAppStore((state) => state.statusText);
  const isStreaming = useAppStore((state) => state.isStreaming);
  const error = useAppStore((state) => state.error);
  const resetConversation = useAppStore((state) => state.resetConversation);
  const { sendMessage } = useChatStream();
  const viewportRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    viewportRef.current?.scrollTo({ top: viewportRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, toolActivities, statusText]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const value = input;
    setInput('');
    await sendMessage(value);
  }

  return (
    <section className="chat-panel" aria-label="Agent chat">
      <header className="panel-header chat-header">
        <div>
          <p className="eyebrow">Native tool calling</p>
          <h1>E2B Coding Agent</h1>
        </div>
        <button className="button button-ghost" type="button" onClick={resetConversation} disabled={isStreaming}>
          New chat
        </button>
      </header>

      <ScrollArea.Root className="chat-scroll scroll-root">
        <ScrollArea.Viewport ref={viewportRef} className="scroll-viewport chat-viewport">
          {messages.length === 0 ? (
            <section className="empty-chat">
              <h2>Ask the agent to build or edit files in E2B.</h2>
              <p>
                Add API keys in Settings, fetch OpenRouter models, then send a request. The backend creates a sandbox first,
                streams model tokens in real time, executes native tool calls, and updates the file tree.
              </p>
            </section>
          ) : null}

          <ol className="message-list">
            {messages.map((message) => (
              <li key={message.id} className={`message message-${message.role}`}>
                {message.role === 'user' ? (
                  <article className="user-bubble">{message.content}</article>
                ) : (
                  <article className="assistant-text">
                    {message.content ? <pre>{message.content}</pre> : message.isStreaming ? null : <span className="muted">No text response.</span>}
                  </article>
                )}
              </li>
            ))}
          </ol>

          {toolActivities.length > 0 ? (
            <section className="tool-activity-stream" aria-label="Tool activity">
              {toolActivities.map((activity) => (
                <ToolChip key={activity.id} activity={activity} />
              ))}
            </section>
          ) : null}

          <ThinkingIndicator text={statusText} />
          {error ? <section className="error-banner" role="alert">{error}</section> : null}
        </ScrollArea.Viewport>
        <ScrollArea.Scrollbar className="scrollbar" orientation="vertical">
          <ScrollArea.Thumb className="scrollbar-thumb" />
        </ScrollArea.Scrollbar>
      </ScrollArea.Root>

      <form className="composer" onSubmit={handleSubmit}>
        <label className="sr-only" htmlFor="agent-message">Message</label>
        <textarea
          id="agent-message"
          value={input}
          rows={1}
          onChange={(event) => setInput(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter' && !event.shiftKey) {
              event.preventDefault();
              event.currentTarget.form?.requestSubmit();
            }
          }}
          placeholder="Create /home/user/project/main.py with a FastAPI app..."
          disabled={isStreaming}
        />
        <button className="button send-button" type="submit" disabled={isStreaming || !input.trim()}>
          Send
        </button>
      </form>
    </section>
  );
}

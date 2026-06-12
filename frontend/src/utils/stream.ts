import type { StreamEvent } from '../types';

export function parseSseChunk(buffer: string): { events: StreamEvent[]; rest: string } {
  const events: StreamEvent[] = [];
  const parts = buffer.split('\n\n');
  const rest = parts.pop() ?? '';

  for (const part of parts) {
    const dataLine = part.split('\n').find((line) => line.startsWith('data:'));
    if (!dataLine) continue;
    try {
      events.push(JSON.parse(dataLine.slice(5).trim()) as StreamEvent);
    } catch {
      // Ignore malformed SSE fragments and continue streaming.
    }
  }

  return { events, rest };
}

export function createId(prefix: string): string {
  return `${prefix}_${crypto.randomUUID()}`;
}

export function extractErrorFromToolResult(content: string): boolean {
  try {
    return JSON.parse(content).is_error === true;
  } catch {
    return false;
  }
}

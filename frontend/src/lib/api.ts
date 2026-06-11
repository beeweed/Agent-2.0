import type { ModelInfo } from '../types';

export function backendUrl(): string {
  // In dev mode, Vite proxies /api to the backend (see vite.config.ts proxy)
  // In production, set VITE_BACKEND_URL or the same proxy setup handles it
  const envUrl = import.meta.env.VITE_BACKEND_URL as string | undefined;
  if (envUrl) {
    return envUrl.replace(/\/$/, '');
  }
  // Fall back to empty string (same origin) — proxy handles /api routes
  return '';
}

export async function fetchModels(apiKey: string): Promise<ModelInfo[]> {
  const response = await fetch(`${backendUrl()}/api/openrouter/models`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ api_key: apiKey }),
  });
  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    throw new Error(payload.detail || 'Unable to fetch models from OpenRouter.');
  }
  const data = await response.json();
  return data.models ?? [];
}

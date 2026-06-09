import type { ModelInfo } from '../types';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL as string | undefined;

export function backendUrl(): string {
  if (!BACKEND_URL) {
    throw new Error('VITE_BACKEND_URL is not configured in frontend/.env');
  }
  return BACKEND_URL.replace(/\/$/, '');
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

import type { ModelInfo } from '../types';

export function backendUrl(): string {
  const envUrl = import.meta.env.VITE_BACKEND_URL as string | undefined;
  if (envUrl) {
    return envUrl.replace(/\/$/, '');
  }
  return '';
}

async function fetchModelsFrom(
  endpoint: string,
  apiKey: string,
  label: string,
): Promise<ModelInfo[]> {
  const response = await fetch(`${backendUrl()}/api/${endpoint}/models`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ api_key: apiKey }),
  });
  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    throw new Error(payload.detail || `Unable to fetch models from ${label}.`);
  }
  const data = await response.json();
  return data.models ?? [];
}

export async function fetchModels(apiKey: string): Promise<ModelInfo[]> {
  return fetchModelsFrom('openrouter', apiKey, 'OpenRouter');
}

export async function fetchNvidiaModels(apiKey: string): Promise<ModelInfo[]> {
  return fetchModelsFrom('nvidia', apiKey, 'NVIDIA NIM');
}

from __future__ import annotations

import httpx
from src.config.settings import settings


class OpenRouterClient:
    def __init__(self) -> None:
        self.base_url = settings.openrouter_base_url.rstrip("/")

    def headers(self, api_key: str) -> dict[str, str]:
        return {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
            "HTTP-Referer": "http://localhost:3000",
            "X-Title": settings.app_name,
        }

    async def list_models(self, api_key: str) -> list[dict]:
        if not api_key:
            raise ValueError("OpenRouter API key is required.")
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.get(f"{self.base_url}/models", headers=self.headers(api_key))
            response.raise_for_status()
            data = response.json()
        models = data.get("data", [])
        return [
            {
                "id": model.get("id"),
                "name": model.get("name") or model.get("id"),
                "context_length": model.get("context_length"),
                "pricing": model.get("pricing", {}),
                "supported_parameters": model.get("supported_parameters", []),
                "supports_tools": "tools" in (model.get("supported_parameters") or []),
            }
            for model in models
            if model.get("id")
        ]


openrouter_client = OpenRouterClient()

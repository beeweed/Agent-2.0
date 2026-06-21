from __future__ import annotations

import httpx
from src.config.settings import settings


class NvidiaNimClient:
    def __init__(self) -> None:
        self.base_url = settings.nvidia_nim_base_url.rstrip("/")

    def headers(self, api_key: str) -> dict[str, str]:
        return {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
        }

    async def list_models(self, api_key: str) -> list[dict]:
        if not api_key:
            raise ValueError("NVIDIA NIM API key is required.")
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.get(f"{self.base_url}/models", headers=self.headers(api_key))
            response.raise_for_status()
            data = response.json()
        models = data.get("data", [])
        return [
            {
                "id": model.get("id"),
                "name": model.get("id"),
                "context_length": model.get("max_model_len"),
                "pricing": {},
                "supported_parameters": [],
                "supports_tools": True,
            }
            for model in models
            if model.get("id")
        ]


nvidia_nim_client = NvidiaNimClient()

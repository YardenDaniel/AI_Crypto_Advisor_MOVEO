import httpx

from app.core.config import settings


class OpenRouterClient:
    """Async client for communicating with the OpenRouter API."""

    def __init__(self) -> None:
        self.base_url = settings.openrouter_base_url
        self.api_key = settings.openrouter_api_key
        self.model = settings.openrouter_model

    async def generate_insight(
        self,
        system_prompt: str,
        user_prompt: str,
    ) -> str:
        """Generate a structured crypto insight using OpenRouter."""

        payload = {
            "model": self.model,
            "messages": [
                {
                    "role": "system",
                    "content": system_prompt,
                },
                {
                    "role": "user",
                    "content": user_prompt,
                },
            ],
            "temperature": 0.3,
            "response_format": {
                "type": "json_object",
            },
        }

        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
        }

        async with httpx.AsyncClient(
            timeout=30.0,
        ) as client:
            response = await client.post(
                f"{self.base_url}/chat/completions",
                headers=headers,
                json=payload,
            )

        response.raise_for_status()

        data = response.json()

        return data["choices"][0]["message"]["content"]
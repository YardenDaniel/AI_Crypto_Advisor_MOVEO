import httpx

from app.core.config import settings


class CoinGeckoClient:
    """Client responsible for communication with the CoinGecko API."""

    def __init__(self) -> None:
        """Initialize the client with CoinGecko configuration."""
        self.base_url = settings.coingecko_base_url
        self.api_key = settings.coingecko_api_key

    async def get_prices(self, coin_ids: list[str]) -> dict:
        """Fetch current market prices for the requested coins."""

        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.get(
                f"{self.base_url}/simple/price",
                headers={
                    "x-cg-demo-api-key": self.api_key,
                },
                params={
                    "ids": ",".join(coin_ids),
                    "vs_currencies": "usd",
                    "include_24hr_change": "true",
                    "include_last_updated_at": "true",
                },
            )

        response.raise_for_status()

        return response.json()
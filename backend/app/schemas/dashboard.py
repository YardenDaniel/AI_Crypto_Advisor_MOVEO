from pydantic import BaseModel


class CoinPriceResponse(BaseModel):
    """Market price information for a crypto asset."""

    symbol: str
    price_usd: float
    change_24h: float | None
    last_updated_at: int | None


class CoinPricesResponse(BaseModel):
    """Coin price section returned by the dashboard API."""

    prices: list[CoinPriceResponse]
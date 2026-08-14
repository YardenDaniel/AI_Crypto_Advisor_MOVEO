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

class MarketNewsItem(BaseModel):
    """A single market news article displayed on the dashboard."""

    title: str
    subtitle: str | None
    source: str
    published_at: str | None
    url: str | None
    image: str | None


class MarketNewsResponse(BaseModel):
    """Market news section returned by the dashboard API."""

    news: list[MarketNewsItem]
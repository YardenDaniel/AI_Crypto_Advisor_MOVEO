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

class NewsSource(BaseModel):
    """Publisher of a market news article."""

    title: str
    domain: str | None = None


class NewsInstrument(BaseModel):
    """A crypto asset mentioned in a market news article."""

    code: str
    title: str | None = None


class MarketNewsItem(BaseModel):
    """A single market news article displayed on the dashboard."""

    id: str
    title: str
    description: str | None = None
    source: NewsSource
    published_at: str | None = None
    instruments: list[NewsInstrument]
    url: str | None = None
    image: str | None = None
    origin: str = "static_fallback"


class MarketNewsResponse(BaseModel):
    """Market news section returned by the dashboard API."""

    news: list[MarketNewsItem]

class MemeResponse(BaseModel):
    """A crypto meme displayed on the dashboard."""

    title: str
    image_url: str | None
    source: str
    source_url: str | None

class AIInsightResponse(BaseModel):
    """Structured AI insight displayed on the dashboard."""

    title: str
    summary: str
    key_points: list[str]
    watch_for: str
    risk_note: str
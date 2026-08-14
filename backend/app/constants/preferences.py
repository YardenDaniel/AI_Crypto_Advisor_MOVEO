from enum import Enum


class InvestorType(str, Enum):
    """Supported investor types."""

    HODLER = "hodler"
    DAY_TRADER = "day_trader"
    NFT_COLLECTOR = "nft_collector"


class ContentType(str, Enum):
    """Supported content types."""

    MARKET_NEWS = "market_news"
    CHARTS = "charts"
    SOCIAL = "social"
    FUN = "fun"


SUPPORTED_ASSETS = [
    "BTC",
    "ETH",
    "SOL",
    "XRP",
    "ADA",
]
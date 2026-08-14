from app.constants.market_news import STATIC_MARKET_NEWS
from app.schemas.dashboard import MarketNewsItem


def get_market_news(
    assets: list[str],
) -> list[MarketNewsItem]:
    """Return static market news relevant to the user's preferred assets."""

    news_items: list[MarketNewsItem] = []

    for asset in assets:
        asset_news = STATIC_MARKET_NEWS.get(asset, [])

        for item in asset_news:
            news_items.append(
                MarketNewsItem(
                    title=item["title"],
                    subtitle=item["subtitle"],
                    source=item["source"],
                    published_at=item["published_at"],
                    url=item["url"],
                    image=item["image"],
                )
            )

    return news_items
from app.constants.market_news import STATIC_MARKET_NEWS
from app.schemas.dashboard import MarketNewsItem

NEWS_FEED_LIMIT = 10


def get_market_news(
    assets: list[str],
) -> list[MarketNewsItem]:
    """Return a CryptoPanic-style news feed filtered by the user's assets.

    Includes articles that mention at least one of the user's preferred
    assets, plus General Crypto News (items with no instruments). Results are
    de-duplicated by ``id``, sorted from newest to oldest, and limited.
    """

    user_assets = set(assets or [])

    selected: list[dict] = []
    seen_ids: set[str] = set()

    for item in STATIC_MARKET_NEWS:
        item_codes = {instrument["code"] for instrument in item["instruments"]}
        is_general = not item_codes
        matches_user_assets = bool(user_assets & item_codes)

        if not (is_general or matches_user_assets):
            continue

        if item["id"] in seen_ids:
            continue

        seen_ids.add(item["id"])
        selected.append(item)

    selected.sort(
        key=lambda item: item.get("published_at") or "",
        reverse=True,
    )

    limited = selected[:NEWS_FEED_LIMIT]

    return [MarketNewsItem(**item) for item in limited]

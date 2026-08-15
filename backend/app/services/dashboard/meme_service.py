import random

import httpx

from app.constants.memes import STATIC_MEMES
from app.integrations.reddit.reddit_scraper import RedditMemeScraper
from app.schemas.dashboard import MemeResponse


async def get_meme(
    assets: list[str],
) -> MemeResponse:
    """Return a personalized Reddit meme or static fallback."""

    scraper = RedditMemeScraper()

    try:
        reddit_meme = await scraper.get_meme(
            assets=assets,
        )

        if reddit_meme is not None:
            return reddit_meme

    except (httpx.HTTPError, ValueError):
        pass

    fallback = random.choice(STATIC_MEMES)

    return MemeResponse(
        title=fallback["title"],
        image_url=fallback["image_url"],
        source=fallback["source"],
        source_url=fallback["source_url"],
    )

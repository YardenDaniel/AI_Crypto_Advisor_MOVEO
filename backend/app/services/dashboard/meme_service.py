import random

import httpx

from app.constants.memes import STATIC_MEMES
from app.integrations.reddit.reddit_scraper import RedditMemeScraper
from app.schemas.dashboard import MemeResponse
from app.services.dashboard.meme_identity import build_meme_item_id


def _static_meme_response(entry: dict) -> MemeResponse:
    """Build a meme response from a static fallback entry."""

    return MemeResponse(
        title=entry["title"],
        image_url=entry["image_url"],
        source=entry["source"],
        source_url=entry["source_url"],
    )


def choose_static_meme(
    exclude_item_ids: set[str],
) -> MemeResponse:
    """Pick a static meme, avoiding the excluded ones when possible."""

    candidates = [
        _static_meme_response(entry)
        for entry in STATIC_MEMES
    ]

    available = [
        meme
        for meme in candidates
        if build_meme_item_id(meme) not in exclude_item_ids
    ]

    # Every static meme was excluded (only happens when a single meme
    # exists), so repeating it is better than showing nothing.
    return random.choice(available or candidates)


async def get_meme(
    assets: list[str],
    exclude_item_ids: set[str] | None = None,
) -> MemeResponse:
    """Return a personalized Reddit meme or static fallback.

    ``exclude_item_ids`` holds memes the user has just seen. They are
    skipped whenever another usable candidate exists.
    """

    excluded = exclude_item_ids or set()

    scraper = RedditMemeScraper()

    reddit_meme: MemeResponse | None = None

    try:
        reddit_meme = await scraper.get_meme(
            assets=assets,
            exclude_item_ids=excluded,
        )

    except (httpx.HTTPError, ValueError):
        reddit_meme = None

    if (
        reddit_meme is not None
        and build_meme_item_id(reddit_meme) not in excluded
    ):
        return reddit_meme

    # Reddit could only offer the meme that was just shown, so a different
    # static meme is preferred over repeating it.
    static_meme = choose_static_meme(excluded)

    if build_meme_item_id(static_meme) not in excluded:
        return static_meme

    return reddit_meme or static_meme

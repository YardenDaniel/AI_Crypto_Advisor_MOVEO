import random

import httpx
from bs4 import BeautifulSoup

from app.constants.memes import ASSET_MEME_KEYWORDS
from app.core.config import settings
from app.schemas.dashboard import MemeResponse


class RedditMemeScraper:
    """Scrape public crypto meme posts from Reddit."""

    async def get_meme(
        self,
        assets: list[str],
    ) -> MemeResponse | None:
        """Return a Reddit meme relevant to the user's preferred assets."""

        async with httpx.AsyncClient(
            timeout=10.0,
            follow_redirects=True,
        ) as client:
            response = await client.get(
                settings.reddit_meme_url,
                headers={
                    "User-Agent": settings.reddit_user_agent,
                },
            )

        response.raise_for_status()

        soup = BeautifulSoup(response.text, "html.parser")

        all_memes: list[MemeResponse] = []
        relevant_memes: list[MemeResponse] = []

        keywords = self._get_keywords(assets)

        for post in soup.select("div.thing.link"):
            image_url = post.get("data-url")
            permalink = post.get("data-permalink")
            title_element = post.select_one("a.title")

            if not image_url or not title_element:
                continue

            if not image_url.lower().endswith(
                (".jpg", ".jpeg", ".png", ".webp")
            ):
                continue

            title = title_element.get_text(strip=True)

            source_url = (
                f"https://www.reddit.com{permalink}"
                if permalink
                else None
            )

            meme = MemeResponse(
                title=title,
                image_url=image_url,
                source="Reddit",
                source_url=source_url,
            )

            all_memes.append(meme)

            if self._is_relevant(
                title=title,
                keywords=keywords,
            ):
                relevant_memes.append(meme)

        meme = await self._choose_available_meme(relevant_memes)

        if meme is not None:
            return meme

        return await self._choose_available_meme(all_memes)

    @staticmethod
    def _get_keywords(assets: list[str]) -> list[str]:
        """Return search keywords for the user's preferred assets."""

        keywords: list[str] = []

        for asset in assets:
            keywords.extend(
                ASSET_MEME_KEYWORDS.get(asset, [])
            )

        return keywords

    @staticmethod
    def _is_relevant(
        title: str,
        keywords: list[str],
    ) -> bool:
        """Check whether a Reddit post title matches an asset keyword."""

        normalized_title = title.lower()

        return any(
            keyword in normalized_title
            for keyword in keywords
        )

    @staticmethod
    async def _is_image_available(image_url: str) -> bool:
        """Check whether the selected Reddit image is still available."""

        try:
            async with httpx.AsyncClient(
                timeout=5.0,
                follow_redirects=True,
            ) as client:
                response = await client.head(image_url)

            content_type = response.headers.get("content-type", "")

            return (
                response.status_code == 200
                and content_type.startswith("image/")
            )

        except httpx.HTTPError:
            return False

    async def _choose_available_meme(
        self,
        memes: list[MemeResponse],
    ) -> MemeResponse | None:
        """Choose a meme whose image is still available."""

        candidates = memes.copy()
        random.shuffle(candidates)

        for meme in candidates:
            if (
                meme.image_url
                and await self._is_image_available(meme.image_url)
            ):
                return meme

        return None
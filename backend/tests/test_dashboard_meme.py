import asyncio
from unittest.mock import AsyncMock, patch

import httpx

from app.integrations.reddit.reddit_scraper import RedditMemeScraper
from app.schemas.dashboard import MemeResponse
from app.services.dashboard.meme_identity import build_meme_item_id
from app.services.dashboard.meme_service import choose_static_meme
from app.services.dashboard.meme_service import get_meme as select_meme


def signup_login_and_set_preferences(client):
    """Create a user, log in, and configure crypto preferences."""

    client.post(
        "/auth/signup",
        json={
            "name": "Meme User",
            "email": "meme@example.com",
            "password": "Test123!",
        },
    )

    login_response = client.post(
        "/auth/login",
        json={
            "email": "meme@example.com",
            "password": "Test123!",
        },
    )

    assert login_response.status_code == 200

    client.post(
        "/preferences",
        json={
            "assets": ["BTC", "SOL"],
            "investor_type": "hodler",
            "content_types": ["fun"],
        },
    )


@patch(
    "app.services.dashboard.meme_service.RedditMemeScraper.get_meme",
    new_callable=AsyncMock,
)
def test_dashboard_meme_returns_reddit_meme(
    mock_get_meme,
    client,
):
    """Test that a Reddit meme is returned when scraping succeeds."""

    mock_get_meme.return_value = MemeResponse(
        title="Bitcoin meme",
        image_url="https://example.com/bitcoin.png",
        source="Reddit",
        source_url="https://reddit.com/example",
    )

    signup_login_and_set_preferences(client)

    response = client.get("/dashboard/meme")

    assert response.status_code == 200

    data = response.json()

    assert data["title"] == "Bitcoin meme"
    assert data["source"] == "Reddit"
    assert data["image_url"] == "https://example.com/bitcoin.png"

    mock_get_meme.assert_called_once_with(
        assets=["BTC", "SOL"],
        exclude_item_ids=set(),
    )


@patch(
    "app.services.dashboard.meme_service.RedditMemeScraper.get_meme",
    new_callable=AsyncMock,
)
def test_dashboard_meme_uses_static_fallback(
    mock_get_meme,
    client,
):
    """Test that static content is used when Reddit returns no meme."""

    mock_get_meme.return_value = None

    signup_login_and_set_preferences(client)

    response = client.get("/dashboard/meme")

    assert response.status_code == 200

    data = response.json()

    assert data["source"] == "Static Fallback"


@patch(
    "app.services.dashboard.meme_service.RedditMemeScraper.get_meme",
    new_callable=AsyncMock,
)
def test_dashboard_meme_uses_fallback_when_reddit_fails(
    mock_get_meme,
    client,
):
    """Test that a Reddit failure does not break the dashboard."""

    mock_get_meme.side_effect = httpx.HTTPError(
        "Reddit unavailable"
    )

    signup_login_and_set_preferences(client)

    response = client.get("/dashboard/meme")

    assert response.status_code == 200

    data = response.json()

    assert data["source"] == "Static Fallback"


def test_dashboard_meme_without_token(client):
    """Test that meme access requires authentication."""

    response = client.get("/dashboard/meme")

    assert response.status_code == 401


def reddit_meme(number: int) -> MemeResponse:
    """Build a distinct Reddit meme for selection tests."""

    return MemeResponse(
        title=f"Meme {number}",
        image_url=f"https://example.com/meme{number}.png",
        source="Reddit",
        source_url=f"https://reddit.com/meme{number}",
    )


@patch(
    "app.services.dashboard.meme_service.RedditMemeScraper.get_meme",
    new_callable=AsyncMock,
)
def test_static_fallback_does_not_repeat_the_previous_meme(
    mock_get_meme,
    client,
):
    """Test that a second request returns a different static meme."""

    mock_get_meme.return_value = None

    signup_login_and_set_preferences(client)

    first = client.get("/dashboard/meme").json()
    second = client.get("/dashboard/meme").json()

    assert first["image_url"] != second["image_url"]
    assert second["source"] == "Static Fallback"


@patch(
    "app.services.dashboard.meme_service.STATIC_MEMES",
    [
        {
            "title": "Crypto Meme 1",
            "image_url": "/memes/meme1.jpeg",
            "source": "Static Fallback",
            "source_url": None,
        }
    ],
)
@patch(
    "app.services.dashboard.meme_service.RedditMemeScraper.get_meme",
    new_callable=AsyncMock,
)
def test_static_fallback_repeats_when_it_is_the_only_candidate(
    mock_get_meme,
    client,
):
    """Test that a single usable meme is returned again instead of failing."""

    mock_get_meme.return_value = None

    signup_login_and_set_preferences(client)

    first = client.get("/dashboard/meme")
    second = client.get("/dashboard/meme")

    assert first.status_code == 200
    assert second.status_code == 200
    assert first.json()["image_url"] == "/memes/meme1.jpeg"
    assert second.json()["image_url"] == "/memes/meme1.jpeg"


@patch(
    "app.services.dashboard.meme_service.RedditMemeScraper.get_meme",
    new_callable=AsyncMock,
)
def test_previously_shown_meme_is_excluded_from_selection(
    mock_get_meme,
    client,
):
    """Test that the last shown meme is passed to selection as excluded."""

    first_meme = reddit_meme(1)
    mock_get_meme.side_effect = [first_meme, reddit_meme(2)]

    signup_login_and_set_preferences(client)

    client.get("/dashboard/meme")
    client.get("/dashboard/meme")

    second_call = mock_get_meme.call_args_list[1]

    assert second_call.kwargs["exclude_item_ids"] == {
        build_meme_item_id(first_meme)
    }


def test_meme_identity_is_stable_per_meme():
    """Test that identity depends only on the meme, not on when it is shown."""

    assert build_meme_item_id(reddit_meme(1)) == build_meme_item_id(
        reddit_meme(1)
    )
    assert build_meme_item_id(reddit_meme(1)) != build_meme_item_id(
        reddit_meme(2)
    )


@patch(
    "app.services.dashboard.meme_service.RedditMemeScraper.get_meme",
    new_callable=AsyncMock,
)
def test_returning_to_an_older_meme_reuses_its_feedback(
    mock_get_meme,
    client,
):
    """Test that each meme keeps its own feedback row across rotations."""

    mock_get_meme.side_effect = [
        reddit_meme(1),
        reddit_meme(2),
        reddit_meme(1),
    ]

    signup_login_and_set_preferences(client)

    first = client.get("/dashboard/meme").json()
    second = client.get("/dashboard/meme").json()
    third = client.get("/dashboard/meme").json()

    assert first["feedback"]["id"] != second["feedback"]["id"]
    assert third["feedback"]["id"] == first["feedback"]["id"]


@patch(
    "app.services.dashboard.meme_service.RedditMemeScraper.get_meme",
    new_callable=AsyncMock,
)
def test_existing_vote_is_preserved_when_a_meme_returns(
    mock_get_meme,
    client,
):
    """Test that rotating away and back keeps the earlier vote."""

    mock_get_meme.side_effect = [
        reddit_meme(1),
        reddit_meme(2),
        reddit_meme(1),
    ]

    signup_login_and_set_preferences(client)

    first = client.get("/dashboard/meme").json()

    vote_response = client.post(
        f"/dashboard/feedback/{first['feedback']['id']}/vote",
        json={"value": "up"},
    )

    assert vote_response.status_code == 200

    client.get("/dashboard/meme")

    third = client.get("/dashboard/meme").json()

    assert third["feedback"]["id"] == first["feedback"]["id"]
    assert third["feedback"]["vote"] == "up"
    assert third["feedback"]["can_vote"] is False


def choose_reddit_candidate(
    memes: list[MemeResponse],
    exclude_item_ids: set[str],
) -> MemeResponse | None:
    """Run Reddit candidate selection with every image reachable."""

    with patch.object(
        RedditMemeScraper,
        "_is_image_available",
        new_callable=AsyncMock,
        return_value=True,
    ):
        return asyncio.run(
            RedditMemeScraper()._choose_available_meme(
                memes,
                exclude_item_ids,
            )
        )


def test_reddit_selection_prefers_a_meme_that_was_not_just_shown():
    """Test that Reddit selection skips the previous meme when it can."""

    previous = reddit_meme(1)
    alternative = reddit_meme(2)

    selected = choose_reddit_candidate(
        [previous, alternative],
        {build_meme_item_id(previous)},
    )

    assert selected == alternative


def test_reddit_selection_never_returns_an_excluded_meme():
    """Test that exclusion is absolute inside candidate selection."""

    previous = reddit_meme(1)

    selected = choose_reddit_candidate(
        [previous],
        {build_meme_item_id(previous)},
    )

    assert selected is None


REDDIT_HTML = """
<div class="thing link" data-url="https://i.redd.it/relevant.png"
     data-permalink="/r/memes/relevant">
  <a class="title">Bitcoin to the moon</a>
</div>
<div class="thing link" data-url="https://i.redd.it/other.png"
     data-permalink="/r/memes/other">
  <a class="title">Crypto Twitter lately</a>
</div>
"""


class FakeResponse:
    """Minimal stand-in for an httpx response."""

    text = REDDIT_HTML

    def raise_for_status(self) -> None:
        """Accept the fake response as successful."""


class FakeAsyncClient:
    """Async client that serves canned Reddit HTML instead of the network."""

    def __init__(self, *args, **kwargs) -> None:
        """Ignore the real client configuration."""

    async def __aenter__(self) -> "FakeAsyncClient":
        """Enter the fake client context."""
        return self

    async def __aexit__(self, *args) -> bool:
        """Leave the fake client context."""
        return False

    async def get(self, *args, **kwargs) -> FakeResponse:
        """Return the canned listing page."""
        return FakeResponse()


def test_reddit_looks_beyond_relevant_posts_to_avoid_a_repeat():
    """Test that a one-post relevant pool cannot pin the user to one meme.

    The asset-relevant pool holds only the meme that was just shown, so the
    scraper must fall back to the wider pool instead of repeating it.
    """

    relevant = MemeResponse(
        title="Bitcoin to the moon",
        image_url="https://i.redd.it/relevant.png",
        source="Reddit",
        source_url="https://www.reddit.com/r/memes/relevant",
    )

    with patch(
        "app.integrations.reddit.reddit_scraper.httpx.AsyncClient",
        FakeAsyncClient,
    ), patch.object(
        RedditMemeScraper,
        "_is_image_available",
        new_callable=AsyncMock,
        return_value=True,
    ):
        selected = asyncio.run(
            RedditMemeScraper().get_meme(
                assets=["BTC"],
                exclude_item_ids={build_meme_item_id(relevant)},
            )
        )

    assert selected is not None
    assert selected.title == "Crypto Twitter lately"


@patch(
    "app.services.dashboard.meme_service.RedditMemeScraper.get_meme",
    new_callable=AsyncMock,
)
def test_static_meme_is_used_when_reddit_can_only_repeat(mock_get_meme):
    """Test that a different static meme beats repeating the Reddit meme."""

    previous = reddit_meme(1)
    mock_get_meme.return_value = previous

    selected = asyncio.run(
        select_meme(
            assets=["BTC"],
            exclude_item_ids={build_meme_item_id(previous)},
        )
    )

    assert selected.source == "Static Fallback"
    assert build_meme_item_id(selected) != build_meme_item_id(previous)


@patch(
    "app.services.dashboard.meme_service.STATIC_MEMES",
    [
        {
            "title": "Crypto Meme 1",
            "image_url": "/memes/meme1.jpeg",
            "source": "Static Fallback",
            "source_url": None,
        }
    ],
)
@patch(
    "app.services.dashboard.meme_service.RedditMemeScraper.get_meme",
    new_callable=AsyncMock,
)
def test_meme_repeats_only_when_no_alternative_exists(mock_get_meme):
    """Test that the last remaining meme is still returned."""

    only_meme = MemeResponse(
        title="Crypto Meme 1",
        image_url="/memes/meme1.jpeg",
        source="Static Fallback",
        source_url=None,
    )
    mock_get_meme.return_value = None

    selected = asyncio.run(
        select_meme(
            assets=["BTC"],
            exclude_item_ids={build_meme_item_id(only_meme)},
        )
    )

    assert selected.image_url == "/memes/meme1.jpeg"


@patch(
    "app.services.dashboard.meme_service.RedditMemeScraper.get_meme",
    new_callable=AsyncMock,
)
def test_dashboard_meme_changes_when_reddit_offers_only_one_post(
    mock_get_meme,
    client,
):
    """Test the end-to-end refresh when Reddit keeps returning one meme."""

    mock_get_meme.return_value = reddit_meme(1)

    signup_login_and_set_preferences(client)

    first = client.get("/dashboard/meme").json()
    second = client.get("/dashboard/meme").json()

    assert first["image_url"] == "https://example.com/meme1.png"
    assert second["image_url"] != first["image_url"]
    assert second["feedback"]["id"] != first["feedback"]["id"]


def test_choose_static_meme_skips_excluded_memes():
    """Test that static selection avoids an excluded meme when it can."""

    from app.services.dashboard.meme_service import STATIC_MEMES

    excluded = choose_static_meme(set())
    excluded_id = build_meme_item_id(excluded)

    for _ in range(10):
        selected = choose_static_meme({excluded_id})

        assert build_meme_item_id(selected) != excluded_id

    assert len(STATIC_MEMES) > 1
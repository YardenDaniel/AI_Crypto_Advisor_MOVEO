import hashlib
from unittest.mock import AsyncMock, patch

from sqlalchemy import func, select

from app.db.models.dashboard_feedback import DashboardFeedback
from app.schemas.dashboard import MemeResponse


# Patch targets for external integrations (kept deterministic, no network).
COINGECKO_GET_PRICES = (
    "app.api.endpoints.dashboard.coin_prices.CoinGeckoClient.get_prices"
)
REDDIT_GET_MEME = (
    "app.services.dashboard.meme_service.RedditMemeScraper.get_meme"
)


# ---------------------------------------------------------------------------
# Shared setup helpers (reuse the project's working signup/login/preferences).
# ---------------------------------------------------------------------------
def signup(client, email, name="Feedback User", password="Password123!"):
    """Register a new user."""

    response = client.post(
        "/auth/signup",
        json={
            "name": name,
            "email": email,
            "password": password,
        },
    )

    assert response.status_code == 201

    return response


def login(client, email, password="Password123!"):
    """Log a user in and return an authorization header."""

    response = client.post(
        "/auth/login",
        json={
            "email": email,
            "password": password,
        },
    )

    assert response.status_code == 200

    token = response.json()["access_token"]

    return {
        "Authorization": f"Bearer {token}",
    }


def set_preferences(client, headers, assets):
    """Configure onboarding preferences for a user."""

    response = client.post(
        "/preferences",
        headers=headers,
        json={
            "assets": assets,
            "investor_type": "hodler",
            "content_types": ["market_news"],
        },
    )

    assert response.status_code == 201


def register_user(client, email, assets=None, name="Feedback User"):
    """Create a user, log in, and optionally set preferences."""

    signup(client, email, name=name)
    headers = login(client, email)

    if assets is not None:
        set_preferences(client, headers, assets)

    return headers


def prices_payload(btc_price):
    """Build a deterministic CoinGecko-style price response for BTC."""

    return {
        "bitcoin": {
            "usd": btc_price,
            "usd_24h_change": 1.5,
            "last_updated_at": 1234567890,
        }
    }


def fixed_meme():
    """Return a stable meme so its derived item_id never changes."""

    return MemeResponse(
        title="Deterministic Bitcoin meme",
        image_url="https://example.com/bitcoin.png",
        source="Reddit",
        source_url="https://www.reddit.com/r/cryptomemes/comments/abc123",
    )


# ---------------------------------------------------------------------------
# 1. Feedback creation
# ---------------------------------------------------------------------------
@patch(COINGECKO_GET_PRICES, new_callable=AsyncMock)
def test_feedback_created_with_defaults(mock_get_prices, client, db):
    """A newly served section creates a feedback row with none/null defaults."""

    mock_get_prices.return_value = prices_payload(60000)

    headers = register_user(client, "creator@example.com", assets=["BTC"])

    response = client.get("/dashboard/prices", headers=headers)

    assert response.status_code == 200

    feedback = response.json()["feedback"]

    assert isinstance(feedback["id"], int)
    assert feedback["vote"] == "none"
    assert feedback["can_vote"] is True

    row = db.get(DashboardFeedback, feedback["id"])

    assert row is not None
    assert row.section == "prices"
    assert row.item_id == "prices-section"
    assert row.vote == "none"
    assert row.voted_at is None
    assert isinstance(row.content_snapshot, dict)
    assert "prices" in row.content_snapshot


# ---------------------------------------------------------------------------
# 2. No duplicate on refresh
# ---------------------------------------------------------------------------
@patch(COINGECKO_GET_PRICES, new_callable=AsyncMock)
def test_no_duplicate_feedback_on_refresh(mock_get_prices, client, db):
    """Refreshing the same content reuses the feedback row (no duplicates)."""

    mock_get_prices.return_value = prices_payload(60000)

    headers = register_user(client, "refresh@example.com", assets=["BTC"])

    first = client.get("/dashboard/prices", headers=headers)
    second = client.get("/dashboard/prices", headers=headers)

    assert first.status_code == 200
    assert second.status_code == 200

    first_id = first.json()["feedback"]["id"]
    second_id = second.json()["feedback"]["id"]

    assert first_id == second_id

    count = db.scalar(
        select(func.count())
        .select_from(DashboardFeedback)
        .where(
            DashboardFeedback.section == "prices",
            DashboardFeedback.item_id == "prices-section",
        )
    )

    assert count == 1


# ---------------------------------------------------------------------------
# 3. UP vote
# ---------------------------------------------------------------------------
@patch(COINGECKO_GET_PRICES, new_callable=AsyncMock)
def test_vote_up(mock_get_prices, client, db):
    """Submitting an UP vote persists the vote and disables further voting."""

    mock_get_prices.return_value = prices_payload(60000)

    headers = register_user(client, "up@example.com", assets=["BTC"])

    feedback_id = (
        client.get("/dashboard/prices", headers=headers)
        .json()["feedback"]["id"]
    )

    response = client.post(
        f"/dashboard/feedback/{feedback_id}/vote",
        headers=headers,
        json={"value": "up"},
    )

    assert response.status_code == 200

    body = response.json()

    assert body["id"] == feedback_id
    assert body["vote"] == "up"
    assert body["can_vote"] is False

    row = db.get(DashboardFeedback, feedback_id)

    assert row.vote == "up"
    assert row.voted_at is not None


# ---------------------------------------------------------------------------
# 4. DOWN vote
# ---------------------------------------------------------------------------
@patch(COINGECKO_GET_PRICES, new_callable=AsyncMock)
def test_vote_down(mock_get_prices, client, db):
    """Submitting a DOWN vote persists the vote and disables further voting."""

    mock_get_prices.return_value = prices_payload(60000)

    headers = register_user(client, "down@example.com", assets=["BTC"])

    feedback_id = (
        client.get("/dashboard/prices", headers=headers)
        .json()["feedback"]["id"]
    )

    response = client.post(
        f"/dashboard/feedback/{feedback_id}/vote",
        headers=headers,
        json={"value": "down"},
    )

    assert response.status_code == 200

    body = response.json()

    assert body["vote"] == "down"
    assert body["can_vote"] is False

    row = db.get(DashboardFeedback, feedback_id)

    assert row.vote == "down"
    assert row.voted_at is not None


# ---------------------------------------------------------------------------
# 5. Vote is one-time
# ---------------------------------------------------------------------------
@patch(COINGECKO_GET_PRICES, new_callable=AsyncMock)
def test_vote_is_one_time(mock_get_prices, client, db):
    """A second vote must not overwrite the original vote."""

    mock_get_prices.return_value = prices_payload(60000)

    headers = register_user(client, "once@example.com", assets=["BTC"])

    feedback_id = (
        client.get("/dashboard/prices", headers=headers)
        .json()["feedback"]["id"]
    )

    first_vote = client.post(
        f"/dashboard/feedback/{feedback_id}/vote",
        headers=headers,
        json={"value": "up"},
    )

    assert first_vote.status_code == 200
    assert first_vote.json()["vote"] == "up"

    second_vote = client.post(
        f"/dashboard/feedback/{feedback_id}/vote",
        headers=headers,
        json={"value": "down"},
    )

    # The current implementation returns the unchanged record (200).
    assert second_vote.status_code == 200
    assert second_vote.json()["vote"] == "up"
    assert second_vote.json()["can_vote"] is False

    row = db.get(DashboardFeedback, feedback_id)

    assert row.vote == "up"


# ---------------------------------------------------------------------------
# 6. Ownership / security
# ---------------------------------------------------------------------------
@patch(COINGECKO_GET_PRICES, new_callable=AsyncMock)
def test_vote_on_other_users_feedback_returns_404(
    mock_get_prices,
    client,
    db,
):
    """A user cannot vote on another user's feedback record."""

    mock_get_prices.return_value = prices_payload(60000)

    headers_a = register_user(client, "owner-a@example.com", assets=["BTC"])

    a_feedback_id = (
        client.get("/dashboard/prices", headers=headers_a)
        .json()["feedback"]["id"]
    )

    headers_b = register_user(client, "intruder-b@example.com", assets=["BTC"])

    response = client.post(
        f"/dashboard/feedback/{a_feedback_id}/vote",
        headers=headers_b,
        json={"value": "up"},
    )

    assert response.status_code == 404

    row = db.get(DashboardFeedback, a_feedback_id)

    assert row.vote == "none"
    assert row.voted_at is None


# ---------------------------------------------------------------------------
# 7. Invalid submitted vote
# ---------------------------------------------------------------------------
def test_vote_rejects_none_value(client):
    """`none` is an internal state and must be rejected by validation."""

    headers = register_user(client, "reject-none@example.com", assets=["BTC"])

    response = client.post(
        "/dashboard/feedback/1/vote",
        headers=headers,
        json={"value": "none"},
    )

    assert response.status_code == 422


def test_vote_rejects_invalid_value(client):
    """An unknown vote value must be rejected by validation."""

    headers = register_user(client, "reject-bad@example.com", assets=["BTC"])

    response = client.post(
        "/dashboard/feedback/1/vote",
        headers=headers,
        json={"value": "banana"},
    )

    assert response.status_code == 422


# ---------------------------------------------------------------------------
# 8. Authentication
# ---------------------------------------------------------------------------
def test_vote_without_token_returns_401(client):
    """Voting requires authentication."""

    response = client.post(
        "/dashboard/feedback/1/vote",
        json={"value": "up"},
    )

    assert response.status_code == 401


# ---------------------------------------------------------------------------
# Market News integration
# ---------------------------------------------------------------------------
def test_market_news_items_have_feedback(client):
    """Every news article carries its own initial (none) feedback."""

    headers = register_user(client, "news@example.com", assets=["BTC", "SOL"])

    response = client.get("/dashboard/news", headers=headers)

    assert response.status_code == 200

    news = response.json()["news"]

    assert len(news) > 0

    feedback_ids = []

    for item in news:
        assert item["feedback"] is not None
        assert item["feedback"]["vote"] == "none"
        assert item["feedback"]["can_vote"] is True
        feedback_ids.append(item["feedback"]["id"])

    # Each article gets its own distinct feedback record.
    assert len(set(feedback_ids)) == len(feedback_ids)


def test_market_news_refresh_reuses_feedback_ids(client):
    """Refreshing news reuses the same feedback id per article."""

    headers = register_user(
        client,
        "news-refresh@example.com",
        assets=["BTC", "SOL"],
    )

    first = client.get("/dashboard/news", headers=headers)
    second = client.get("/dashboard/news", headers=headers)

    assert first.status_code == 200
    assert second.status_code == 200

    first_map = {
        item["id"]: item["feedback"]["id"]
        for item in first.json()["news"]
    }
    second_map = {
        item["id"]: item["feedback"]["id"]
        for item in second.json()["news"]
    }

    assert first_map == second_map


# ---------------------------------------------------------------------------
# Meme integration
# ---------------------------------------------------------------------------
@patch(REDDIT_GET_MEME, new_callable=AsyncMock)
def test_meme_response_has_feedback(mock_get_meme, client, db):
    """The meme response carries an initial (none) feedback record."""

    mock_get_meme.return_value = fixed_meme()

    headers = register_user(client, "meme@example.com", assets=["BTC"])

    response = client.get("/dashboard/meme", headers=headers)

    assert response.status_code == 200

    feedback = response.json()["feedback"]

    assert feedback is not None
    assert feedback["vote"] == "none"
    assert feedback["can_vote"] is True

    meme = fixed_meme()
    expected_item_id = hashlib.sha256(
        meme.source_url.encode("utf-8")
    ).hexdigest()

    row = db.get(DashboardFeedback, feedback["id"])

    assert row.section == "meme"
    assert row.item_id == expected_item_id


@patch(REDDIT_GET_MEME, new_callable=AsyncMock)
def test_meme_same_meme_reuses_feedback_id(mock_get_meme, client, db):
    """Returning the same meme again reuses the same feedback record."""

    mock_get_meme.return_value = fixed_meme()

    headers = register_user(client, "meme-refresh@example.com", assets=["BTC"])

    first = client.get("/dashboard/meme", headers=headers)
    second = client.get("/dashboard/meme", headers=headers)

    assert first.status_code == 200
    assert second.status_code == 200

    assert first.json()["feedback"]["id"] == second.json()["feedback"]["id"]

    count = db.scalar(
        select(func.count())
        .select_from(DashboardFeedback)
        .where(DashboardFeedback.section == "meme")
    )

    assert count == 1


# ---------------------------------------------------------------------------
# Coin Prices integration (section-level feedback identity)
# ---------------------------------------------------------------------------
@patch(COINGECKO_GET_PRICES, new_callable=AsyncMock)
def test_coin_prices_feedback_is_section_level(mock_get_prices, client, db):
    """Prices feedback is about the section, stable across changing prices."""

    mock_get_prices.side_effect = [
        prices_payload(60000),
        prices_payload(70000),
    ]

    headers = register_user(client, "prices@example.com", assets=["BTC"])

    first = client.get("/dashboard/prices", headers=headers)
    second = client.get("/dashboard/prices", headers=headers)

    assert first.status_code == 200
    assert second.status_code == 200

    # The underlying market price changed between requests...
    assert first.json()["prices"][0]["price_usd"] == 60000
    assert second.json()["prices"][0]["price_usd"] == 70000

    # ...but the section-level feedback record stays the same.
    assert first.json()["feedback"]["id"] == second.json()["feedback"]["id"]

    row = db.get(DashboardFeedback, first.json()["feedback"]["id"])

    assert row.item_id == "prices-section"

    count = db.scalar(
        select(func.count())
        .select_from(DashboardFeedback)
        .where(DashboardFeedback.section == "prices")
    )

    assert count == 1

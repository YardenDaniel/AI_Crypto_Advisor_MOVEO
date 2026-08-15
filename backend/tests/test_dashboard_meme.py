from unittest.mock import AsyncMock, patch

import httpx

from app.schemas.dashboard import MemeResponse


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

    token = login_response.json()["access_token"]

    headers = {
        "Authorization": f"Bearer {token}",
    }

    client.post(
        "/preferences",
        headers=headers,
        json={
            "assets": ["BTC", "SOL"],
            "investor_type": "hodler",
            "content_types": ["fun"],
        },
    )

    return headers


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

    headers = signup_login_and_set_preferences(client)

    response = client.get(
        "/dashboard/meme",
        headers=headers,
    )

    assert response.status_code == 200

    data = response.json()

    assert data["title"] == "Bitcoin meme"
    assert data["source"] == "Reddit"
    assert data["image_url"] == "https://example.com/bitcoin.png"

    mock_get_meme.assert_called_once_with(
        assets=["BTC", "SOL"],
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

    headers = signup_login_and_set_preferences(client)

    response = client.get(
        "/dashboard/meme",
        headers=headers,
    )

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

    headers = signup_login_and_set_preferences(client)

    response = client.get(
        "/dashboard/meme",
        headers=headers,
    )

    assert response.status_code == 200

    data = response.json()

    assert data["source"] == "Static Fallback"


def test_dashboard_meme_without_token(client):
    """Test that meme access requires authentication."""

    response = client.get("/dashboard/meme")

    assert response.status_code == 401
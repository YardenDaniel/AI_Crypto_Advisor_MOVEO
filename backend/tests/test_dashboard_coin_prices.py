from unittest.mock import AsyncMock, patch

import httpx


def signup_login_and_set_preferences(client):
    """Create a user, log in, and configure crypto preferences."""

    client.post(
        "/auth/signup",
        json={
            "name": "Dashboard User",
            "email": "dashboard@example.com",
            "password": "Test123!",
        },
    )

    login_response = client.post(
        "/auth/login",
        json={
            "email": "dashboard@example.com",
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
            "content_types": ["market_news", "charts"],
        },
    )

    return headers


@patch(
    "app.api.endpoints.dashboard.coin_prices.CoinGeckoClient.get_prices",
    new_callable=AsyncMock,
)
def test_dashboard_returns_preferred_coin_prices(
    mock_get_prices,
    client,
):
    """Test that the dashboard returns prices for the user's preferred assets."""

    mock_get_prices.return_value = {
        "bitcoin": {
            "usd": 60000,
            "usd_24h_change": 1.5,
            "last_updated_at": 1234567890,
        },
        "solana": {
            "usd": 75,
            "usd_24h_change": -0.8,
            "last_updated_at": 1234567891,
        },
    }

    headers = signup_login_and_set_preferences(client)

    response = client.get(
        "/dashboard/prices",
        headers=headers,
    )

    assert response.status_code == 200

    data = response.json()

    assert len(data["prices"]) == 2

    assert data["prices"][0]["symbol"] == "BTC"
    assert data["prices"][0]["price_usd"] == 60000

    assert data["prices"][1]["symbol"] == "SOL"
    assert data["prices"][1]["price_usd"] == 75


@patch(
    "app.api.endpoints.dashboard.coin_prices.CoinGeckoClient.get_prices",
    new_callable=AsyncMock,
)
def test_dashboard_uses_user_preferred_assets(
    mock_get_prices,
    client,
):
    """Test that CoinGecko receives only the user's selected crypto assets."""

    mock_get_prices.return_value = {
        "bitcoin": {
            "usd": 60000,
            "usd_24h_change": 1.5,
            "last_updated_at": 1234567890,
        },
        "solana": {
            "usd": 75,
            "usd_24h_change": -0.8,
            "last_updated_at": 1234567891,
        },
    }

    headers = signup_login_and_set_preferences(client)

    response = client.get(
        "/dashboard/prices",
        headers=headers,
    )

    assert response.status_code == 200

    mock_get_prices.assert_called_once_with(
        ["bitcoin", "solana"]
    )


def test_dashboard_prices_without_token(client):
    """Test that dashboard price access requires authentication."""

    response = client.get("/dashboard/prices")

    assert response.status_code == 401


@patch(
    "app.api.endpoints.dashboard.coin_prices.CoinGeckoClient.get_prices",
    new_callable=AsyncMock,
)
def test_dashboard_prices_coingecko_failure_degrades_gracefully(
    mock_get_prices,
    client,
):
    """A CoinGecko failure returns empty prices (200), not a raw 500."""

    mock_get_prices.side_effect = httpx.HTTPError("CoinGecko unavailable")

    headers = signup_login_and_set_preferences(client)

    response = client.get(
        "/dashboard/prices",
        headers=headers,
    )

    assert response.status_code == 200

    data = response.json()

    assert data["prices"] == []

    # The section still exposes feedback metadata (independence preserved).
    assert data["feedback"] is not None
    assert data["feedback"]["vote"] == "none"
    assert data["feedback"]["can_vote"] is True
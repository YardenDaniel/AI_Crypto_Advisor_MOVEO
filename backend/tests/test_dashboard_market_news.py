def signup_login_and_set_preferences(client, assets=None):
    """Create a user, log in, and configure crypto preferences."""

    if assets is None:
        assets = ["BTC", "SOL"]

    client.post(
        "/auth/signup",
        json={
            "name": "News User",
            "email": "news@example.com",
            "password": "Test123!",
        },
    )

    login_response = client.post(
        "/auth/login",
        json={
            "email": "news@example.com",
            "password": "Test123!",
        },
    )

    assert login_response.status_code == 200

    client.post(
        "/preferences",
        json={
            "assets": assets,
            "investor_type": "hodler",
            "content_types": ["market_news"],
        },
    )


def _instrument_codes(news):
    """Collect all instrument codes present across the news feed."""

    return {
        instrument["code"]
        for item in news
        for instrument in item["instruments"]
    }


def test_dashboard_news_returns_preferred_assets(client):
    """Test that market news matches the user's preferred crypto assets."""

    signup_login_and_set_preferences(client, assets=["BTC", "SOL"])

    response = client.get("/dashboard/news")

    assert response.status_code == 200

    news = response.json()["news"]
    codes = _instrument_codes(news)

    assert "BTC" in codes
    assert "SOL" in codes


def test_dashboard_news_includes_general_crypto_news(client):
    """Test that General Crypto News (no instruments) is always included."""

    signup_login_and_set_preferences(client, assets=["BTC", "SOL"])

    response = client.get("/dashboard/news")

    assert response.status_code == 200

    news = response.json()["news"]

    assert any(item["instruments"] == [] for item in news)


def test_dashboard_news_excludes_unselected_assets(client):
    """Test that asset-specific news for unselected assets is not returned."""

    signup_login_and_set_preferences(client, assets=["BTC", "SOL"])

    response = client.get("/dashboard/news")

    assert response.status_code == 200

    codes = _instrument_codes(response.json()["news"])

    assert "ETH" not in codes


def test_dashboard_news_sorted_newest_to_oldest(client):
    """Test that the news feed is ordered from newest to oldest."""

    signup_login_and_set_preferences(client, assets=["BTC", "SOL"])

    response = client.get("/dashboard/news")

    assert response.status_code == 200

    published = [item["published_at"] for item in response.json()["news"]]

    # Items without a verified date (published_at is None) sort last; normalize
    # to "" so the comparison mirrors the service's sort key and never raises.
    normalized = [value or "" for value in published]

    assert normalized == sorted(normalized, reverse=True)


def test_dashboard_news_item_structure(client):
    """Test that each news item exposes the new CryptoPanic-style structure."""

    signup_login_and_set_preferences(client, assets=["BTC", "SOL"])

    response = client.get("/dashboard/news")

    assert response.status_code == 200

    news = response.json()["news"]

    assert len(news) > 0

    for item in news:
        assert "id" in item
        assert "title" in item
        assert "source" in item
        assert "title" in item["source"]
        assert "published_at" in item
        assert "instruments" in item
        assert "url" in item
        assert item["origin"] == "static_fallback"


def test_dashboard_news_without_token(client):
    """Test that market news requires authentication."""

    response = client.get("/dashboard/news")

    assert response.status_code == 401

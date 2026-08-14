def signup_login_and_set_preferences(client):
    """Create a user, log in, and configure crypto preferences."""

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
            "content_types": ["market_news"],
        },
    )

    return headers


def test_dashboard_news_returns_preferred_assets(client):
    """Test that market news matches the user's preferred crypto assets."""

    headers = signup_login_and_set_preferences(client)

    response = client.get(
        "/dashboard/news",
        headers=headers,
    )

    assert response.status_code == 200

    data = response.json()

    assert len(data["news"]) == 2

    titles = [item["title"] for item in data["news"]]

    assert "Bitcoin Market Update" in titles
    assert "Solana Market Update" in titles


def test_dashboard_news_excludes_unselected_assets(client):
    """Test that news for unselected assets is not returned."""

    headers = signup_login_and_set_preferences(client)

    response = client.get(
        "/dashboard/news",
        headers=headers,
    )

    assert response.status_code == 200

    titles = [
        item["title"]
        for item in response.json()["news"]
    ]

    assert "Ethereum Market Update" not in titles


def test_dashboard_news_without_token(client):
    """Test that market news requires authentication."""

    response = client.get("/dashboard/news")

    assert response.status_code == 401
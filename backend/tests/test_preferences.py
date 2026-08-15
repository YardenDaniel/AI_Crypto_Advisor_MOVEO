def signup_and_login(client):
    """Create a test user and establish an authenticated cookie session."""
    client.post(
        "/auth/signup",
        json={
            "name": "Test User",
            "email": "test@example.com",
            "password": "Test123!",
        },
    )

    response = client.post(
        "/auth/login",
        json={
            "email": "test@example.com",
            "password": "Test123!",
        },
    )

    assert response.status_code == 200


def test_create_preferences(client):
    """Test that an authenticated user can create preferences."""
    signup_and_login(client)

    response = client.post(
        "/preferences",
        json={
            "assets": ["BTC", "ETH"],
            "investor_type": "hodler",
            "content_types": ["market_news", "charts"],
        },
    )

    assert response.status_code == 201

    data = response.json()

    assert data["assets"] == ["BTC", "ETH"]
    assert data["investor_type"] == "hodler"
    assert data["content_types"] == ["market_news", "charts"]
    assert "user_id" in data


def test_get_preferences(client):
    """Test that an authenticated user can retrieve their preferences."""
    signup_and_login(client)

    client.post(
        "/preferences",
        json={
            "assets": ["BTC", "ETH"],
            "investor_type": "hodler",
            "content_types": ["market_news"],
        },
    )

    response = client.get("/preferences")

    assert response.status_code == 200

    data = response.json()

    assert data["assets"] == ["BTC", "ETH"]
    assert data["investor_type"] == "hodler"
    assert data["content_types"] == ["market_news"]


def test_update_preferences(client):
    """Test that an authenticated user can partially update preferences."""
    signup_and_login(client)

    client.post(
        "/preferences",
        json={
            "assets": ["BTC", "ETH"],
            "investor_type": "hodler",
            "content_types": ["market_news"],
        },
    )

    response = client.patch(
        "/preferences",
        json={
            "assets": ["BTC", "SOL"],
        },
    )

    assert response.status_code == 200

    data = response.json()

    assert data["assets"] == ["BTC", "SOL"]
    assert data["investor_type"] == "hodler"
    assert data["content_types"] == ["market_news"]


def test_reject_unsupported_asset(client):
    """Test that unsupported crypto assets are rejected."""
    signup_and_login(client)

    response = client.post(
        "/preferences",
        json={
            "assets": ["BTC", "BANANA_COIN"],
            "investor_type": "hodler",
            "content_types": ["market_news"],
        },
    )

    assert response.status_code == 422


def test_reject_duplicate_preferences(client):
    """Test that a user cannot create preferences twice."""
    signup_and_login(client)

    preferences = {
        "assets": ["BTC"],
        "investor_type": "hodler",
        "content_types": ["market_news"],
    }

    first_response = client.post(
        "/preferences",
        json=preferences,
    )

    second_response = client.post(
        "/preferences",
        json=preferences,
    )

    assert first_response.status_code == 201
    assert second_response.status_code == 409


def test_preferences_without_token(client):
    """Test that preferences cannot be accessed without authentication."""
    response = client.get("/preferences")

    assert response.status_code == 401

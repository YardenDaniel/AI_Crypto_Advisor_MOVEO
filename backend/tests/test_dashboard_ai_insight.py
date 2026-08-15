from unittest.mock import AsyncMock, patch

from app.schemas.dashboard import AIInsightResponse


def signup_login_and_set_preferences(client):
    """Create a user, log in, and configure dashboard preferences."""

    signup_response = client.post(
        "/auth/signup",
        json={
            "name": "AI Insight Test User",
            "email": "ai-insight-test@example.com",
            "password": "Password123!",
        },
    )

    assert signup_response.status_code == 201

    login_response = client.post(
        "/auth/login",
        json={
            "email": "ai-insight-test@example.com",
            "password": "Password123!",
        },
    )

    assert login_response.status_code == 200

    token = login_response.json()["access_token"]

    headers = {
        "Authorization": f"Bearer {token}",
    }

    preferences_response = client.post(
        "/preferences",
        headers=headers,
        json={
            "assets": ["BTC", "ETH"],
            "investor_type": "hodler",
            "content_types": ["market_news"],
        },
    )

    assert preferences_response.status_code == 201

    return headers


@patch(
    "app.api.endpoints.dashboard.ai_insight.generate_ai_insight",
    new_callable=AsyncMock,
)
def test_dashboard_ai_insight_generates_new_insight(
    mock_generate_ai_insight,
    client,
):
    """Test that a new AI insight is generated when none exists today."""

    mock_generate_ai_insight.return_value = AIInsightResponse(
        title="Bitcoin Market Update",
        summary="Bitcoin remains the main focus of today's market.",
        key_points=[
            "Bitcoin remains active.",
            "Market volatility should be monitored.",
            "Long-term sentiment remains relevant.",
        ],
        watch_for="Watch Bitcoin market volatility.",
        risk_note="This is informational content, not financial advice.",
    )

    headers = signup_login_and_set_preferences(client)

    response = client.get(
        "/dashboard/insight",
        headers=headers,
    )

    assert response.status_code == 200

    data = response.json()

    assert data["title"] == "Bitcoin Market Update"
    assert data["feedback"] is not None
    assert data["feedback"]["vote"] == "none"
    assert data["feedback"]["can_vote"] is True

    mock_generate_ai_insight.assert_awaited_once()


@patch(
    "app.api.endpoints.dashboard.ai_insight.generate_ai_insight",
    new_callable=AsyncMock,
)
def test_dashboard_ai_insight_reuses_daily_insight(
    mock_generate_ai_insight,
    client,
):
    """Test that today's stored AI insight is reused instead of regenerated."""

    mock_generate_ai_insight.return_value = AIInsightResponse(
        title="Daily Market Insight",
        summary="Today's personalized crypto market summary.",
        key_points=[
            "Bitcoin remains important.",
            "Ethereum activity remains relevant.",
            "Market volatility should be monitored.",
        ],
        watch_for="Watch for significant market changes.",
        risk_note="This is informational content, not financial advice.",
    )

    headers = signup_login_and_set_preferences(client)

    first_response = client.get(
        "/dashboard/insight",
        headers=headers,
    )

    second_response = client.get(
        "/dashboard/insight",
        headers=headers,
    )

    assert first_response.status_code == 200
    assert second_response.status_code == 200

    first_data = first_response.json()
    second_data = second_response.json()

    assert first_data["title"] == second_data["title"]

    # The same daily insight must also reuse the same feedback record.
    assert first_data["feedback"]["id"] == second_data["feedback"]["id"]

    mock_generate_ai_insight.assert_awaited_once()


@patch(
    "app.api.endpoints.dashboard.ai_insight.generate_ai_insight",
    new_callable=AsyncMock,
)
def test_dashboard_ai_insight_response_structure(
    mock_generate_ai_insight,
    client,
):
    """Test that the AI insight response has the expected structured fields."""

    mock_generate_ai_insight.return_value = AIInsightResponse(
        title="Structured Market Insight",
        summary="A concise summary of today's crypto market context.",
        key_points=[
            "First market observation.",
            "Second market observation.",
            "Third market observation.",
        ],
        watch_for="Watch for changes in market volatility.",
        risk_note="This is educational information, not financial advice.",
    )

    headers = signup_login_and_set_preferences(client)

    response = client.get(
        "/dashboard/insight",
        headers=headers,
    )

    assert response.status_code == 200

    data = response.json()

    assert set(data.keys()) == {
        "title",
        "summary",
        "key_points",
        "watch_for",
        "risk_note",
        "feedback",
    }

    assert isinstance(data["title"], str)
    assert isinstance(data["summary"], str)
    assert isinstance(data["key_points"], list)
    assert isinstance(data["watch_for"], str)
    assert isinstance(data["risk_note"], str)

    assert data["feedback"] is not None

    assert set(data["feedback"].keys()) == {
        "id",
        "vote",
        "can_vote",
    }

    assert isinstance(data["feedback"]["id"], int)
    assert data["feedback"]["vote"] == "none"
    assert data["feedback"]["can_vote"] is True


def test_dashboard_ai_insight_without_token(client):
    """Test that AI insight access requires authentication."""

    response = client.get("/dashboard/insight")

    assert response.status_code == 401
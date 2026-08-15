from unittest.mock import AsyncMock, patch

from app.db.models.ai_insight import AIInsight
from app.schemas.dashboard import AIInsightResponse


def signup_login_and_set_preferences(client):
    """Create a user, log in, and configure crypto preferences."""

    client.post(
        "/auth/signup",
        json={
            "name": "AI Insight User",
            "email": "ai-insight@example.com",
            "password": "Test123!",
        },
    )

    login_response = client.post(
        "/auth/login",
        json={
            "email": "ai-insight@example.com",
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
    "app.api.endpoints.dashboard.ai_insight.generate_ai_insight",
    new_callable=AsyncMock,
)
def test_dashboard_ai_insight_generates_new_insight(
    mock_generate_ai_insight,
    client,
    db,
):
    """Test that a new AI insight is generated and stored when none exists."""

    mock_generate_ai_insight.return_value = AIInsightResponse(
        title="BTC and SOL Market Watch",
        summary=(
            "Bitcoin remains relatively stable while Solana shows "
            "higher short-term volatility."
        ),
        key_points=[
            "Bitcoin is holding relatively steady.",
            "Solana is showing higher short-term volatility.",
            "Market sentiment remains mixed.",
        ],
        watch_for="Watch whether Solana weakness continues.",
        risk_note="This is educational information, not financial advice.",
    )

    headers = signup_login_and_set_preferences(client)

    response = client.get(
        "/dashboard/insight",
        headers=headers,
    )

    assert response.status_code == 200

    data = response.json()

    assert data["title"] == "BTC and SOL Market Watch"
    assert len(data["key_points"]) == 3
    assert data["watch_for"] == "Watch whether Solana weakness continues."

    # Verify that the AI generation service received the user's preferences.
    mock_generate_ai_insight.assert_awaited_once_with(
        investor_type="hodler",
        assets=["BTC", "SOL"],
    )

    # Verify that the generated insight was persisted in the database.
    stored_insights = db.query(AIInsight).all()

    assert len(stored_insights) == 1
    assert stored_insights[0].title == "BTC and SOL Market Watch"


@patch(
    "app.api.endpoints.dashboard.ai_insight.generate_ai_insight",
    new_callable=AsyncMock,
)
def test_dashboard_ai_insight_reuses_daily_insight(
    mock_generate_ai_insight,
    client,
    db,
):
    """Test that today's stored insight is reused instead of regenerated."""

    mock_generate_ai_insight.return_value = AIInsightResponse(
        title="Daily Crypto Insight",
        summary="The market is showing mixed short-term signals.",
        key_points=[
            "Bitcoin remains relatively stable.",
            "Solana is experiencing more volatility.",
            "Broader market sentiment remains mixed.",
        ],
        watch_for="Monitor changes in short-term market momentum.",
        risk_note="This is educational information, not financial advice.",
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

    # Both requests should return exactly the same daily insight.
    assert first_response.json() == second_response.json()

    # The LLM should be called only for the first request.
    mock_generate_ai_insight.assert_awaited_once()

    # Only one insight should exist for the user for the current day.
    stored_insights = db.query(AIInsight).all()

    assert len(stored_insights) == 1


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
    }

    assert isinstance(data["key_points"], list)
    assert len(data["key_points"]) == 3


def test_dashboard_ai_insight_without_token(client):
    """Test that AI insight access requires authentication."""

    response = client.get("/dashboard/insight")

    assert response.status_code == 401
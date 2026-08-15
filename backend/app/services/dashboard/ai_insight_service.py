import json
from datetime import datetime, timedelta, timezone

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.constants.ai_insight import AI_INSIGHT_SYSTEM_PROMPT
from app.db.models.ai_insight import AIInsight
from app.integrations.crypto.coingecko_client import CoinGeckoClient
from app.integrations.llm.openrouter_client import OpenRouterClient
from app.schemas.dashboard import (
    AIInsightResponse,
    CoinPriceResponse,
    MarketNewsItem,
)
from app.services.dashboard.coin_price_service import get_coin_prices
from app.services.dashboard.market_news_service import get_market_news


def get_today_ai_insight(
    db: Session,
    user_id: int,
) -> AIInsight | None:
    """Get today's generated AI insight for a specific user."""

    now = datetime.now(timezone.utc)

    start_of_day = now.replace(
        hour=0,
        minute=0,
        second=0,
        microsecond=0,
    )

    end_of_day = start_of_day + timedelta(days=1)

    statement = (
        select(AIInsight)
        .where(
            AIInsight.user_id == user_id,
            AIInsight.generated_at >= start_of_day,
            AIInsight.generated_at < end_of_day,
        )
        .order_by(AIInsight.generated_at.desc())
    )

    return db.scalars(statement).first()


def create_ai_insight(
    db: Session,
    user_id: int,
    data: AIInsightResponse,
) -> AIInsight:
    """Store a generated AI insight for a specific user."""

    insight = AIInsight(
        user_id=user_id,
        title=data.title,
        summary=data.summary,
        key_points=data.key_points,
        watch_for=data.watch_for,
        risk_note=data.risk_note,
    )

    db.add(insight)
    db.commit()
    db.refresh(insight)

    return insight


def build_ai_insight_user_prompt(
    investor_type: str,
    assets: list[str],
    prices: list[CoinPriceResponse],
    news: list[MarketNewsItem],
) -> str:
    """Build the dynamic user context sent to the AI model."""

    price_lines: list[str] = []

    for price in prices:
        change_text = (
            f"{price.change_24h:.2f}%"
            if price.change_24h is not None
            else "unavailable"
        )

        price_lines.append(
            f"- {price.symbol}: "
            f"${price.price_usd:,.2f}, "
            f"24h change: {change_text}"
        )

    prices_text = "\n".join(price_lines)

    if not prices_text:
        prices_text = "No current market price data available."

    news_text = "\n".join(
        f"- {item.title} ({item.source.title})"
        for item in news
    )

    if not news_text:
        news_text = "No relevant market news available."

    assets_text = (
        ", ".join(assets)
        if assets
        else "No selected assets"
    )

    return f"""
Generate today's crypto insight using the following context.

Investor type:
{investor_type}

Selected assets:
{assets_text}

Current market data:
{prices_text}

Relevant market news:
{news_text}
""".strip()


async def generate_ai_insight(
    investor_type: str,
    assets: list[str],
) -> AIInsightResponse:
    """Generate a new personalized AI insight."""

    coin_gecko_client = CoinGeckoClient()
    openrouter_client = OpenRouterClient()

    prices = await get_coin_prices(
        assets=assets,
        client=coin_gecko_client,
    )

    news = get_market_news(
        assets=assets,
    )

    user_prompt = build_ai_insight_user_prompt(
        investor_type=investor_type,
        assets=assets,
        prices=prices,
        news=news,
    )

    raw_response = await openrouter_client.generate_insight(
        system_prompt=AI_INSIGHT_SYSTEM_PROMPT,
        user_prompt=user_prompt,
    )

    parsed_response = json.loads(raw_response)

    return AIInsightResponse.model_validate(
        parsed_response
    )
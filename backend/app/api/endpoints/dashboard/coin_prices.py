import httpx
from fastapi import APIRouter, Depends
from fastapi.concurrency import run_in_threadpool
from sqlalchemy.orm import Session

from app.api.dependencies.auth import get_current_user
from app.constants.dashboard_feedback import FeedbackSection, FeedbackVote
from app.db.database import get_db
from app.db.models.user import User
from app.integrations.crypto.coingecko_client import CoinGeckoClient
from app.schemas.dashboard import (
    CoinPricesResponse,
    DashboardFeedbackResponse,
)
from app.services.dashboard.coin_price_service import get_coin_prices
from app.services.dashboard.dashboard_feedback_service import (
    get_or_create_feedback,
)
from app.services.preference_service import get_preferences_by_user_id


router = APIRouter(
    prefix="/dashboard/prices",
    tags=["Dashboard"],
)


@router.get(
    "",
    response_model=CoinPricesResponse,
)
async def get_dashboard_prices(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Return coin prices and feedback status for the current user."""

    preferences = await run_in_threadpool(
        get_preferences_by_user_id,
        db=db,
        user_id=current_user.id,
    )

    if preferences is None:
        return CoinPricesResponse(
            prices=[],
            feedback=None,
        )

    client = CoinGeckoClient()

    try:
        prices = await get_coin_prices(
            assets=preferences.assets,
            client=client,
        )
    except httpx.HTTPError:
        # CoinGecko is unavailable/timed out. Degrade gracefully to an empty
        # price list instead of returning a raw 500, keeping this section
        # independent of the others.
        prices = []

    content_snapshot = {
        "prices": [
            price.model_dump(mode="json")
            for price in prices
        ]
    }

    feedback = await run_in_threadpool(
        get_or_create_feedback,
        db,
        current_user.id,
        FeedbackSection.PRICES,
        "prices-section",
        content_snapshot,
    )

    return CoinPricesResponse(
        prices=prices,
        feedback=DashboardFeedbackResponse(
            id=feedback.id,
            vote=FeedbackVote(feedback.vote),
            can_vote=feedback.vote == FeedbackVote.NONE.value,
        ),
    )
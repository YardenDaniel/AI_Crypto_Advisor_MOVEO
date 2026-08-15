from fastapi import APIRouter, Depends
from fastapi.concurrency import run_in_threadpool
from sqlalchemy.orm import Session

from app.api.dependencies.auth import get_current_user
from app.constants.dashboard_feedback import FeedbackSection, FeedbackVote
from app.db.database import get_db
from app.db.models.user import User
from app.schemas.dashboard import (
    DashboardFeedbackResponse,
    MarketNewsResponse,
)
from app.services.dashboard.dashboard_feedback_service import (
    get_or_create_feedback,
)
from app.services.dashboard.market_news_service import get_market_news
from app.services.preference_service import get_preferences_by_user_id


router = APIRouter(
    prefix="/dashboard/news",
    tags=["Dashboard"],
)


@router.get(
    "",
    response_model=MarketNewsResponse,
)
async def get_dashboard_news(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Return market news and feedback status for the authenticated user."""

    preferences = await run_in_threadpool(
        get_preferences_by_user_id,
        db=db,
        user_id=current_user.id,
    )

    if preferences is None:
        return MarketNewsResponse(news=[])

    news = get_market_news(
        assets=preferences.assets,
    )

    news_with_feedback = []

    for item in news:
        content_snapshot = item.model_dump(
            mode="json",
            exclude={"feedback"},
        )

        feedback = await run_in_threadpool(
            get_or_create_feedback,
            db,
            current_user.id,
            FeedbackSection.NEWS,
            item.id,
            content_snapshot,
        )

        feedback_response = DashboardFeedbackResponse(
            id=feedback.id,
            vote=FeedbackVote(feedback.vote),
            can_vote=feedback.vote == FeedbackVote.NONE.value,
        )

        news_with_feedback.append(
            item.model_copy(
                update={
                    "feedback": feedback_response,
                }
            )
        )

    return MarketNewsResponse(
        news=news_with_feedback,
    )
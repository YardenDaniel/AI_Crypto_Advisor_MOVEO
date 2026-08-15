from fastapi import APIRouter, Depends
from fastapi.concurrency import run_in_threadpool
from sqlalchemy.orm import Session

from app.api.dependencies.auth import get_current_user
from app.db.database import get_db
from app.db.models.user import User
from app.schemas.dashboard import MarketNewsResponse
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
    """Return market news based on the authenticated user's preferences."""

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

    return MarketNewsResponse(
        news=news,
    )
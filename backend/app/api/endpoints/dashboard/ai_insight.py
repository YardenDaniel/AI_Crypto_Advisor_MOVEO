from fastapi import APIRouter, Depends
from fastapi.concurrency import run_in_threadpool
from sqlalchemy.orm import Session

from app.api.dependencies.auth import get_current_user
from app.db.database import get_db
from app.db.models.user import User
from app.schemas.dashboard import AIInsightResponse
from app.services.dashboard.ai_insight_service import (
    create_ai_insight,
    generate_ai_insight,
    get_today_ai_insight,
)
from app.services.preference_service import get_preferences_by_user_id


router = APIRouter(
    prefix="/dashboard/insight",
    tags=["Dashboard"],
)


@router.get(
    "",
    response_model=AIInsightResponse,
)
async def get_dashboard_ai_insight(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Return today's personalized AI insight for the current user."""

    preferences = await run_in_threadpool(
        get_preferences_by_user_id,
        db,
        current_user.id,
    )

    if preferences is None:
        return AIInsightResponse(
            title="No Preferences Yet",
            summary=(
                "Complete your preferences to receive a personalized "
                "AI insight of the day."
            ),
            key_points=[
                "No crypto assets are currently selected.",
                "Investor type is not available yet.",
                "Personalized market context cannot be generated yet.",
            ],
            watch_for="Complete onboarding to enable personalized insights.",
            risk_note="This is informational content, not financial advice.",
        )

    existing_insight = await run_in_threadpool(
        get_today_ai_insight,
        db,
        current_user.id,
    )

    if existing_insight is not None:
        return AIInsightResponse(
            title=existing_insight.title,
            summary=existing_insight.summary,
            key_points=existing_insight.key_points,
            watch_for=existing_insight.watch_for,
            risk_note=existing_insight.risk_note,
        )

    generated_insight = await generate_ai_insight(
        investor_type=preferences.investor_type,
        assets=preferences.assets,
    )

    await run_in_threadpool(
        create_ai_insight,
        db,
        current_user.id,
        generated_insight,
    )

    return generated_insight
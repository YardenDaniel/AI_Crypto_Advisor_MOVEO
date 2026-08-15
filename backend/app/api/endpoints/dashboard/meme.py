import hashlib

from fastapi import APIRouter, Depends
from fastapi.concurrency import run_in_threadpool
from sqlalchemy.orm import Session

from app.api.dependencies.auth import get_current_user
from app.constants.dashboard_feedback import FeedbackSection, FeedbackVote
from app.db.database import get_db
from app.db.models.user import User
from app.schemas.dashboard import (
    DashboardFeedbackResponse,
    MemeResponse,
)
from app.services.dashboard.dashboard_feedback_service import (
    get_or_create_feedback,
)
from app.services.dashboard.meme_service import get_meme
from app.services.preference_service import get_preferences_by_user_id


router = APIRouter(
    prefix="/dashboard/meme",
    tags=["Dashboard"],
)


@router.get(
    "",
    response_model=MemeResponse,
)
async def get_dashboard_meme(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Return a crypto meme and its feedback status."""

    preferences = await run_in_threadpool(
        get_preferences_by_user_id,
        db=db,
        user_id=current_user.id,
    )

    assets = (
        preferences.assets
        if preferences is not None
        else []
    )

    meme = await get_meme(
        assets=assets,
    )

    content_snapshot = meme.model_dump(
        mode="json",
        exclude={"feedback"},
    )

    identifier_source = (
        meme.source_url
        or meme.image_url
        or meme.title
    )

    item_id = hashlib.sha256(
        identifier_source.encode("utf-8")
    ).hexdigest()

    feedback = await run_in_threadpool(
        get_or_create_feedback,
        db,
        current_user.id,
        FeedbackSection.MEME,
        item_id,
        content_snapshot,
    )

    feedback_response = DashboardFeedbackResponse(
        id=feedback.id,
        vote=FeedbackVote(feedback.vote),
        can_vote=feedback.vote == FeedbackVote.NONE.value,
    )

    return meme.model_copy(
        update={
            "feedback": feedback_response,
        }
    )
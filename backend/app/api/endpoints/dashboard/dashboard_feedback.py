from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.concurrency import run_in_threadpool
from sqlalchemy.orm import Session

from app.api.dependencies.auth import get_current_user
from app.db.database import get_db
from app.db.models.user import User
from app.schemas.dashboard import (
    DashboardFeedbackResponse,
    DashboardVoteCreate,
)
from app.services.dashboard.dashboard_feedback_service import submit_vote


router = APIRouter(
    prefix="/dashboard/feedback",
    tags=["Dashboard"],
)


@router.post(
    "/{feedback_id}/vote",
    response_model=DashboardFeedbackResponse,
)
async def vote_for_dashboard_content(
    feedback_id: int,
    data: DashboardVoteCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Submit a one-time vote for displayed dashboard content."""

    feedback = await run_in_threadpool(
        submit_vote,
        db,
        feedback_id,
        current_user.id,
        data.value,
    )

    if feedback is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Feedback item not found.",
        )

    return DashboardFeedbackResponse(
        id=feedback.id,
        vote=feedback.vote,
        can_vote=feedback.vote == "none",
    )
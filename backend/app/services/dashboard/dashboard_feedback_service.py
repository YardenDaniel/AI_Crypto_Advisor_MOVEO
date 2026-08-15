from datetime import datetime, timezone

from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.constants.dashboard_feedback import (
    FeedbackSection,
    FeedbackVote,
    FeedbackVoteInput,
)
from app.db.models.dashboard_feedback import DashboardFeedback


def get_or_create_feedback(
    db: Session,
    user_id: int,
    section: FeedbackSection,
    item_id: str,
    content_snapshot: dict,
) -> DashboardFeedback:
    """Get existing feedback or register newly displayed dashboard content."""

    statement = select(DashboardFeedback).where(
        DashboardFeedback.user_id == user_id,
        DashboardFeedback.section == section.value,
        DashboardFeedback.item_id == item_id,
    )

    existing_feedback = db.scalars(statement).first()

    if existing_feedback is not None:
        return existing_feedback

    feedback = DashboardFeedback(
        user_id=user_id,
        section=section.value,
        item_id=item_id,
        content_snapshot=content_snapshot,
        vote=FeedbackVote.NONE.value,
    )

    db.add(feedback)

    try:
        db.commit()
    except IntegrityError:
        # A concurrent request created the same record first. Roll back and
        # return the row that request already inserted.
        db.rollback()

        existing_feedback = db.scalars(statement).first()

        if existing_feedback is None:
            raise

        return existing_feedback

    db.refresh(feedback)

    return feedback


def get_last_shown_item_id(
    db: Session,
    user_id: int,
    section: FeedbackSection,
) -> str | None:
    """Return the item the user saw most recently in a dashboard section."""

    statement = (
        select(DashboardFeedback.item_id)
        .where(
            DashboardFeedback.user_id == user_id,
            DashboardFeedback.section == section.value,
        )
        .order_by(
            DashboardFeedback.shown_at.desc(),
            DashboardFeedback.id.desc(),
        )
        .limit(1)
    )

    return db.scalars(statement).first()


def mark_feedback_shown(
    db: Session,
    feedback: DashboardFeedback,
) -> DashboardFeedback:
    """Record that displayed content was shown again, keeping the vote."""

    feedback.shown_at = datetime.now(timezone.utc)

    db.commit()
    db.refresh(feedback)

    return feedback


def submit_vote(
    db: Session,
    feedback_id: int,
    user_id: int,
    vote: FeedbackVoteInput,
) -> DashboardFeedback | None:
    """Submit a one-time vote for dashboard content."""

    feedback = db.get(DashboardFeedback, feedback_id)

    if feedback is None or feedback.user_id != user_id:
        return None

    if feedback.vote != FeedbackVote.NONE.value:
        return feedback

    feedback.vote = vote.value
    feedback.voted_at = datetime.now(timezone.utc)

    db.commit()
    db.refresh(feedback)

    return feedback

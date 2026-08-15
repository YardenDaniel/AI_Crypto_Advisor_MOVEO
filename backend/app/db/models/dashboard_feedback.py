from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, JSON, String, UniqueConstraint, func
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class DashboardFeedback(Base):
    """Tracks dashboard content shown to a user and their optional vote."""

    __tablename__ = "dashboard_feedback"

    __table_args__ = (
        UniqueConstraint(
            "user_id",
            "section",
            "item_id",
            name="uq_dashboard_feedback_user_section_item",
        ),
    )

    id: Mapped[int] = mapped_column(primary_key=True)

    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"),
        index=True,
    )

    section: Mapped[str] = mapped_column(
        String(20),
        index=True,
    )

    item_id: Mapped[str] = mapped_column(
        String(255),
        index=True,
    )

    content_snapshot: Mapped[dict] = mapped_column(JSON)

    vote: Mapped[str] = mapped_column(
        String(10),
        default="none",
        nullable=False,
    )

    shown_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    voted_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )
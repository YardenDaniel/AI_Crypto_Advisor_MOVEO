from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, JSON, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class AIInsight(Base):
    """Represents a generated daily AI insight for a user."""

    __tablename__ = "ai_insights"

    id: Mapped[int] = mapped_column(primary_key=True)

    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"),
        index=True,
    )

    title: Mapped[str] = mapped_column(String(150))
    summary: Mapped[str] = mapped_column(Text)

    # Stored as JSON because the AI returns exactly three structured key points.
    key_points: Mapped[list[str]] = mapped_column(JSON)

    watch_for: Mapped[str] = mapped_column(Text)
    risk_note: Mapped[str] = mapped_column(Text)

    generated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
        index=True,
    )

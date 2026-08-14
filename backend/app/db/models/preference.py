from sqlalchemy import ARRAY, Enum as SqlEnum, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column

from app.constants.preferences import ContentType, InvestorType
from app.db.base import Base


class Preference(Base):
    """Stores onboarding preferences for a single user."""

    __tablename__ = "preferences"

    # The user ID identifies the preference record and links it to the user.
    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id"),
        primary_key=True,
    )

    # The user selects one investor type from the supported options.
    investor_type: Mapped[InvestorType] = mapped_column(
        SqlEnum(InvestorType),
        nullable=False,
    )

    # The user can select multiple crypto assets.
    assets: Mapped[list[str]] = mapped_column(
        ARRAY(String(20)),
        nullable=False,
    )

    # The user can select multiple content types from the supported options.
    content_types: Mapped[list[ContentType]] = mapped_column(
        ARRAY(SqlEnum(ContentType)),
        nullable=False,
    )
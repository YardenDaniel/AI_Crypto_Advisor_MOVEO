from sqlalchemy.orm import Session

from app.db.models.preference import Preference
from app.schemas.preferences import PreferenceCreate, PreferenceUpdate


def get_preferences_by_user_id(
    db: Session,
    user_id: int,
) -> Preference | None:
    """Get the preferences of a specific user."""
    return db.get(Preference, user_id)


def create_preferences(
    db: Session,
    user_id: int,
    data: PreferenceCreate,
) -> Preference:
    """Create preferences for a user."""
    preferences = Preference(
        user_id=user_id,
        assets=data.assets,
        investor_type=data.investor_type,
        content_types=data.content_types,
    )

    db.add(preferences)
    db.commit()
    db.refresh(preferences)

    return preferences


def update_preferences(
    db: Session,
    preferences: Preference,
    data: PreferenceUpdate,
) -> Preference:
    """Update an existing user's preferences."""

    update_data = data.model_dump(exclude_unset=True)

    for field, value in update_data.items():
        setattr(preferences, field, value)

    db.commit()
    db.refresh(preferences)

    return preferences
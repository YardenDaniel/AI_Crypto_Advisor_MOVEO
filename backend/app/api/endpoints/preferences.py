from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.dependencies.auth import get_current_user
from app.db.database import get_db
from app.db.models.user import User
from app.schemas.preferences import (
    PreferenceCreate,
    PreferenceResponse,
    PreferenceUpdate,
)
from app.services.preference_service import (
    create_preferences,
    get_preferences_by_user_id,
    update_preferences,
)


router = APIRouter(
    prefix="/preferences",
    tags=["Preferences"],
)


@router.post(
    "",
    response_model=PreferenceResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_user_preferences(
    request: PreferenceCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Create onboarding preferences for the authenticated user."""

    existing_preferences = get_preferences_by_user_id(
        db,
        current_user.id,
    )

    if existing_preferences:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Preferences already exist",
        )

    return create_preferences(
        db=db,
        user_id=current_user.id,
        data=request,
    )


@router.get(
    "",
    response_model=PreferenceResponse,
)
def get_user_preferences(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get preferences for the authenticated user."""

    preferences = get_preferences_by_user_id(
        db,
        current_user.id,
    )

    if not preferences:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Preferences not found",
        )

    return preferences


@router.patch(
    "",
    response_model=PreferenceResponse,
)
def update_user_preferences(
    request: PreferenceUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Update preferences for the authenticated user."""

    preferences = get_preferences_by_user_id(
        db,
        current_user.id,
    )

    if not preferences:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Preferences not found",
        )

    return update_preferences(
        db=db,
        preferences=preferences,
        data=request,
    )
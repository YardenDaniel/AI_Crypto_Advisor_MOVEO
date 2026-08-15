from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.dependencies.auth import get_current_user
from app.db.database import get_db
from app.db.models.user import User
from app.schemas.dashboard import MemeResponse
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
def get_dashboard_meme(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Return a crypto meme based on the user's preferred assets."""

    preferences = get_preferences_by_user_id(
        db=db,
        user_id=current_user.id,
    )

    assets = (
        preferences.assets
        if preferences is not None
        else []
    )

    return get_meme(
        assets=assets,
    )
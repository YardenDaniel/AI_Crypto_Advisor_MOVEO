from fastapi import APIRouter, Depends
from fastapi.concurrency import run_in_threadpool
from sqlalchemy.orm import Session

from app.api.dependencies.auth import get_current_user
from app.db.database import get_db
from app.db.models.user import User
from app.integrations.crypto.coingecko_client import CoinGeckoClient
from app.schemas.dashboard import CoinPricesResponse
from app.services.dashboard.coin_price_service import get_coin_prices
from app.services.preference_service import get_preferences_by_user_id


router = APIRouter(
    prefix="/dashboard/prices",
    tags=["Dashboard"],
)


@router.get(
    "",
    response_model=CoinPricesResponse,
)
async def get_dashboard_prices(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Return coin prices based on the authenticated user's preferences."""

    preferences = await run_in_threadpool(
        get_preferences_by_user_id,
        db=db,
        user_id=current_user.id,
    )

    if preferences is None:
        return CoinPricesResponse(prices=[])

    client = CoinGeckoClient()

    prices = await get_coin_prices(
        assets=preferences.assets,
        client=client,
    )

    return CoinPricesResponse(
        prices=prices,
    )
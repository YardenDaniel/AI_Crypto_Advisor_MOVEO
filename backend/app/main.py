from fastapi import FastAPI

from app.api.endpoints.auth import router as auth_router
from app.api.endpoints.preferences import router as preferences_router
from app.api.endpoints.dashboard.coin_prices import (
    router as dashboard_coin_prices_router,
)
from app.api.endpoints.dashboard.market_news import (
    router as dashboard_market_news_router,
)
from app.api.endpoints.dashboard.meme import (
    router as dashboard_meme_router,
)
app = FastAPI()

app.include_router(auth_router)
app.include_router(preferences_router)
app.include_router(dashboard_coin_prices_router)
app.include_router(dashboard_market_news_router)
app.include_router(dashboard_meme_router)
@app.get("/health")
def health_check():
    return {"status": "ok"}
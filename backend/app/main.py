from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

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
from app.api.endpoints.dashboard.ai_insight import (
    router as dashboard_ai_insight_router,
)
from app.api.endpoints.dashboard.dashboard_feedback import (
    router as dashboard_feedback_router,
)
from app.core.config import settings


app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PATCH", "OPTIONS"],
    allow_headers=["Content-Type", "Accept"],
)

app.include_router(auth_router)
app.include_router(preferences_router)
app.include_router(dashboard_coin_prices_router)
app.include_router(dashboard_market_news_router)
app.include_router(dashboard_meme_router)
app.include_router(dashboard_ai_insight_router)
app.include_router(dashboard_feedback_router)


@app.get("/health")
def health_check():
    return {"status": "ok"}

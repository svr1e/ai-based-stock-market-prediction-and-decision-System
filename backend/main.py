from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from contextlib import asynccontextmanager
import logging

from core.config import settings
from core.database import connect_db, disconnect_db
from routers import auth, stocks, predictions, portfolio, sentiment, analytics, risk, recommendations, chatbot, watchlist, notifications, admin, websocket_router

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup and shutdown events."""
    logger.info("🚀 Starting StockAI API...")
    await connect_db()
    yield
    logger.info("🛑 Shutting down StockAI API...")
    await disconnect_db()


app = FastAPI(
    title=settings.APP_NAME,
    version=settings.VERSION,
    description="AI-Powered Stock Market Prediction & Investment Decision Support API",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    lifespan=lifespan,
)

# ─── CORS ───────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── ROUTERS ────────────────────────────────────────────────
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(stocks.router, prefix="/api/stocks", tags=["Stocks"])
app.include_router(predictions.router, prefix="/api/predictions", tags=["Predictions"])
app.include_router(portfolio.router, prefix="/api/portfolio", tags=["Portfolio"])
app.include_router(sentiment.router, prefix="/api/sentiment", tags=["Sentiment"])
app.include_router(analytics.router, prefix="/api/analytics", tags=["Analytics"])
app.include_router(risk.router, prefix="/api/risk", tags=["Risk"])
app.include_router(recommendations.router, prefix="/api/recommendations", tags=["Recommendations"])
app.include_router(chatbot.router, prefix="/api/chatbot", tags=["Chatbot"])
app.include_router(watchlist.router, prefix="/api/watchlist", tags=["Watchlist"])
app.include_router(notifications.router, prefix="/api/notifications", tags=["Notifications"])
app.include_router(admin.router, prefix="/api/admin", tags=["Admin"])
app.include_router(websocket_router.router, prefix="/ws", tags=["WebSocket"])


@app.get("/")
async def root():
    return {
        "name": settings.APP_NAME,
        "version": settings.VERSION,
        "status": "running",
        "docs": "/api/docs",
    }


@app.get("/api/health")
async def health_check():
    return {"status": "healthy", "version": settings.VERSION}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host=settings.HOST, port=settings.PORT, reload=settings.DEBUG)

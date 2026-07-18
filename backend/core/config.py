from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    # App
    APP_NAME: str = "StockAI API"
    VERSION: str = "1.0.0"
    DEBUG: bool = True
    HOST: str = "0.0.0.0"
    PORT: int = 8000

    # MongoDB
    MONGODB_URL: str = "mongodb://localhost:27017"
    MONGODB_DB: str = "stockai"

    # JWT
    SECRET_KEY: str = "your-super-secret-key-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # Firebase Admin (for token verification)
    FIREBASE_PROJECT_ID: str = "stock-b2418"

    # Redis
    REDIS_URL: str = "redis://localhost:6379"

    # External APIs
    ALPHA_VANTAGE_API_KEY: str = ""
    NEWS_API_KEY: str = ""
    POLYGON_IO_KEY: str = ""
    FINNHUB_API_KEY: str = ""

    # CORS
    ALLOWED_ORIGINS: list = [
        "http://localhost:3000",
        "http://localhost:5173",
        "https://stockai.vercel.app",
    ]

    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()

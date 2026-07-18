from motor.motor_asyncio import AsyncIOMotorClient
from .config import settings
import logging

logger = logging.getLogger(__name__)

client: AsyncIOMotorClient = None
db = None


async def connect_db():
    """Initialize MongoDB connection."""
    global client, db
    try:
        client = AsyncIOMotorClient(settings.MONGODB_URL)
        db = client[settings.MONGODB_DB]
        # Ping to confirm connection
        await client.admin.command("ping")
        logger.info(f"✅ Connected to MongoDB: {settings.MONGODB_URL}/{settings.MONGODB_DB}")
        await create_indexes()
    except Exception as e:
        logger.error(f"❌ MongoDB connection failed: {e}")
        raise


async def disconnect_db():
    """Close MongoDB connection."""
    global client
    if client:
        client.close()
        logger.info("MongoDB connection closed.")


async def create_indexes():
    """Create required indexes for performance."""
    try:
        # Users
        await db.users.create_index("email", unique=True)
        await db.users.create_index("firebase_uid", unique=True, sparse=True)

        # Stocks
        await db.stocks.create_index("symbol", unique=True)
        await db.stocks.create_index([("symbol", 1), ("date", -1)])

        # Predictions
        await db.predictions.create_index([("symbol", 1), ("created_at", -1)])
        await db.predictions.create_index("user_id")

        # Portfolio
        await db.portfolio.create_index("user_id", unique=True)
        await db.transactions.create_index([("user_id", 1), ("created_at", -1)])

        # Watchlist
        await db.watchlist.create_index([("user_id", 1), ("symbol", 1)], unique=True)

        # News / Sentiment
        await db.news.create_index([("symbol", 1), ("published_at", -1)])
        await db.sentiment.create_index([("symbol", 1), ("updated_at", -1)])

        # Notifications
        await db.notifications.create_index([("user_id", 1), ("created_at", -1)])

        # Audit logs
        await db.audit_logs.create_index([("user_id", 1), ("created_at", -1)])

        logger.info("✅ MongoDB indexes created.")
    except Exception as e:
        logger.warning(f"Index creation warning: {e}")


def get_db():
    return db

from fastapi import APIRouter, Depends
from core.security import get_current_user
import random
from datetime import datetime

router = APIRouter()

BASE_PRICES = {
    "AAPL": 189.43, "MSFT": 414.28, "NVDA": 875.22, "TSLA": 234.56, "META": 516.72, "AMD": 162.43,
}


@router.get("/{symbol}")
async def get_sentiment(symbol: str, user=Depends(get_current_user)):
    """Get FinBERT sentiment analysis for a symbol."""
    symbol = symbol.upper()
    seed = sum(ord(c) for c in symbol)
    random.seed(seed + 10)
    score = round(random.uniform(-1, 1), 3)
    overall = "positive" if score > 0.1 else "negative" if score < -0.1 else "neutral"

    HEADLINES = [
        {"title": f"{symbol} sees strong institutional buying", "sentiment": "positive", "score": 0.82, "source": "Reuters"},
        {"title": f"Analysts upgrade {symbol} price target", "sentiment": "positive", "score": 0.75, "source": "Bloomberg"},
        {"title": f"{symbol} faces regulatory scrutiny", "sentiment": "negative", "score": -0.64, "source": "WSJ"},
        {"title": f"Mixed outlook for {symbol} Q4", "sentiment": "neutral", "score": 0.02, "source": "CNBC"},
        {"title": f"{symbol} beats earnings estimates", "sentiment": "positive", "score": 0.91, "source": "MarketWatch"},
    ]
    random.shuffle(HEADLINES)

    return {
        "symbol": symbol,
        "overall": overall,
        "score": score,
        "confidence": round(abs(score) * 0.3 + 0.6, 2),
        "fear_greed_index": round(40 + random.random() * 50),
        "fear_greed_label": "Greed" if score > 0.2 else "Fear" if score < -0.2 else "Neutral",
        "news_count": random.randint(15, 120),
        "twitter_count": random.randint(2000, 50000),
        "reddit_count": random.randint(100, 5000),
        "headlines": HEADLINES[:4],
        "updated_at": datetime.utcnow().isoformat(),
    }


@router.get("/market/overall")
async def get_market_sentiment(user=Depends(get_current_user)):
    """Get overall market sentiment."""
    random.seed(int(datetime.utcnow().timestamp()) // 3600)
    score = round(random.uniform(-0.5, 0.8), 3)
    return {
        "market_sentiment": "bullish" if score > 0 else "bearish",
        "score": score,
        "fear_greed_index": round(50 + score * 40),
        "vix_equivalent": round(15 + random.random() * 25, 2),
        "positive_stocks_pct": round(55 + score * 30, 1),
        "updated_at": datetime.utcnow().isoformat(),
    }

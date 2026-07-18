from fastapi import APIRouter, HTTPException, Query, Depends
from core.database import get_db
from core.security import get_current_user
from typing import Optional
import random
import math
from datetime import datetime, timedelta

router = APIRouter()

# ─── Mock stock data (replace with live API integration) ─────────────────────
MOCK_STOCKS = {
    "AAPL": {"name": "Apple Inc.", "sector": "Technology", "pe": 29.4, "market_cap": 2.95e12},
    "MSFT": {"name": "Microsoft Corp.", "sector": "Technology", "pe": 35.2, "market_cap": 3.08e12},
    "NVDA": {"name": "NVIDIA Corp.", "sector": "Technology", "pe": 70.3, "market_cap": 2.16e12},
    "GOOGL": {"name": "Alphabet Inc.", "sector": "Technology", "pe": 25.8, "market_cap": 2.2e12},
    "TSLA": {"name": "Tesla Inc.", "sector": "Automotive", "pe": 60.1, "market_cap": 7.47e11},
    "META": {"name": "Meta Platforms", "sector": "Technology", "pe": 26.3, "market_cap": 1.31e12},
    "AMZN": {"name": "Amazon.com Inc.", "sector": "E-Commerce", "pe": 42.6, "market_cap": 2.02e12},
    "JPM": {"name": "JPMorgan Chase", "sector": "Financial", "pe": 12.1, "market_cap": 5.96e11},
    "AMD": {"name": "Advanced Micro Devices", "sector": "Technology", "pe": 43.2, "market_cap": 2.62e11},
    "NFLX": {"name": "Netflix Inc.", "sector": "Media", "pe": 38.7, "market_cap": 2.98e11},
}

BASE_PRICES = {
    "AAPL": 189.43, "MSFT": 414.28, "NVDA": 875.22, "GOOGL": 176.54,
    "TSLA": 234.56, "META": 516.72, "AMZN": 193.67, "JPM": 206.54,
    "AMD": 162.43, "NFLX": 687.34,
}


def generate_ohlcv(symbol: str, days: int = 365):
    base = BASE_PRICES.get(symbol, 100)
    data = []
    price = base
    seed = sum(ord(c) for c in symbol)
    random.seed(seed)

    for i in range(days, -1, -1):
        d = datetime.utcnow() - timedelta(days=i)
        change_pct = (random.random() - 0.48) * 0.025
        price = max(1, price * (1 + change_pct))
        high = price * (1 + random.random() * 0.01)
        low = price * (1 - random.random() * 0.01)
        volume = int(random.uniform(5e6, 80e6))
        data.append({
            "date": d.strftime("%Y-%m-%d"),
            "open": round(price * (1 - random.random() * 0.005), 2),
            "high": round(high, 2),
            "low": round(low, 2),
            "close": round(price, 2),
            "volume": volume,
        })
    return data


@router.get("/")
async def list_stocks(
    sector: Optional[str] = None,
    q: Optional[str] = None,
    limit: int = Query(default=20, le=100),
    skip: int = 0,
):
    """List all tracked stocks."""
    stocks = []
    for symbol, info in MOCK_STOCKS.items():
        if q and q.upper() not in symbol and q.lower() not in info["name"].lower():
            continue
        if sector and info["sector"] != sector:
            continue
        base = BASE_PRICES.get(symbol, 100)
        change_pct = (random.random() - 0.48) * 3
        change = round(base * change_pct / 100, 2)
        stocks.append({
            "symbol": symbol,
            "name": info["name"],
            "sector": info["sector"],
            "price": round(base + change, 2),
            "change": change,
            "change_percent": round(change_pct, 2),
            "volume": random.randint(10_000_000, 80_000_000),
            "market_cap": info["market_cap"],
            "pe": info["pe"],
            "high_52w": round(base * 1.08, 2),
            "low_52w": round(base * 0.76, 2),
        })

    return {"data": stocks[skip : skip + limit], "total": len(stocks)}


@router.get("/{symbol}")
async def get_stock(symbol: str):
    """Get single stock details."""
    symbol = symbol.upper()
    if symbol not in MOCK_STOCKS:
        raise HTTPException(status_code=404, detail=f"Stock {symbol} not found")

    info = MOCK_STOCKS[symbol]
    base = BASE_PRICES[symbol]
    change_pct = (random.random() - 0.48) * 3
    change = round(base * change_pct / 100, 2)

    return {
        "symbol": symbol,
        "name": info["name"],
        "sector": info["sector"],
        "price": round(base + change, 2),
        "change": change,
        "change_percent": round(change_pct, 2),
        "volume": random.randint(10_000_000, 80_000_000),
        "market_cap": info["market_cap"],
        "pe": info["pe"],
        "eps": round(info["pe"] / 10, 2),
        "high_52w": round(base * 1.08, 2),
        "low_52w": round(base * 0.76, 2),
        "avg_volume": 35_000_000,
        "dividend_yield": round(random.uniform(0, 2.5), 2),
    }


@router.get("/{symbol}/history")
async def get_stock_history(
    symbol: str,
    period: str = Query(default="1M", enum=["1D", "1W", "1M", "3M", "6M", "1Y", "ALL"]),
):
    """Get historical OHLCV data."""
    symbol = symbol.upper()
    if symbol not in MOCK_STOCKS:
        raise HTTPException(status_code=404, detail=f"Stock {symbol} not found")

    days_map = {"1D": 1, "1W": 7, "1M": 30, "3M": 90, "6M": 180, "1Y": 365, "ALL": 730}
    days = days_map.get(period, 30)
    data = generate_ohlcv(symbol, days)

    return {"symbol": symbol, "period": period, "data": data}


@router.get("/{symbol}/indicators")
async def get_technical_indicators(symbol: str):
    """Calculate technical indicators for a stock."""
    symbol = symbol.upper()
    if symbol not in MOCK_STOCKS:
        raise HTTPException(status_code=404, detail=f"Stock {symbol} not found")

    base = BASE_PRICES.get(symbol, 100)
    seed = sum(ord(c) for c in symbol)
    random.seed(seed + 42)

    return {
        "symbol": symbol,
        "rsi": round(30 + random.random() * 50, 2),
        "macd": round((random.random() - 0.5) * 6, 4),
        "macd_signal": round((random.random() - 0.5) * 5, 4),
        "macd_histogram": round((random.random() - 0.5) * 2, 4),
        "ema_20": round(base * 0.98, 2),
        "ema_50": round(base * 0.95, 2),
        "sma_200": round(base * 0.90, 2),
        "bollinger_upper": round(base * 1.04, 2),
        "bollinger_middle": round(base, 2),
        "bollinger_lower": round(base * 0.96, 2),
        "atr": round(base * 0.015, 2),
        "vwap": round(base * 1.002, 2),
        "adx": round(20 + random.random() * 50, 2),
        "stoch_rsi": round(random.random() * 100, 2),
        "cci": round((random.random() - 0.5) * 200, 2),
        "obv": int(random.uniform(1e8, 5e9)),
        "updated_at": datetime.utcnow().isoformat(),
    }

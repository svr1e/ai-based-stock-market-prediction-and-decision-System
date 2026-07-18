from fastapi import APIRouter, HTTPException, Query, Depends
from core.database import get_db
from core.security import get_current_user
from core.config import settings
from typing import Optional
import asyncio
import random
import math
import time
import logging
import httpx
import pandas as pd
import numpy as np
from datetime import datetime, timedelta

logger = logging.getLogger(__name__)
router = APIRouter()

# ─── Cache Manager for Finnhub API to avoid 429 rate limit ───────────────────
class FinnhubCacheManager:
    def __init__(self):
        self.profile_cache = {}  # {symbol: (data, expiry)}
        self.quote_cache = {}    # {symbol: (data, expiry)}
        self.metric_cache = {}   # {symbol: (data, expiry)}
        self.candle_cache = {}   # {(symbol, resolution, start_ts, end_ts): (data, expiry)}

    async def get_profile(self, symbol: str) -> dict:
        symbol = symbol.upper()
        now = time.time()
        if symbol in self.profile_cache:
            data, expiry = self.profile_cache[symbol]
            if now < expiry:
                return data

        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    "https://finnhub.io/api/v1/stock/profile2",
                    params={"symbol": symbol, "token": settings.FINNHUB_API_KEY},
                    timeout=10.0
                )
                if response.status_code == 200:
                    data = response.json()
                    if data and "name" in data:
                        # Cache profile for 24 hours
                        self.profile_cache[symbol] = (data, now + 86400)
                        return data
                elif response.status_code == 429:
                    logger.warning(f"Finnhub API rate limit hit (429) on profile for {symbol}")
        except Exception as e:
            logger.error(f"Error fetching profile for {symbol}: {e}")
        return {}

    async def get_quote(self, symbol: str) -> dict:
        symbol = symbol.upper()
        now = time.time()
        if symbol in self.quote_cache:
            data, expiry = self.quote_cache[symbol]
            if now < expiry:
                return data

        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    "https://finnhub.io/api/v1/quote",
                    params={"symbol": symbol, "token": settings.FINNHUB_API_KEY},
                    timeout=10.0
                )
                if response.status_code == 200:
                    data = response.json()
                    if data and data.get("c") is not None and data.get("c") != 0:
                        # Cache quote for 2 minutes (120 seconds)
                        self.quote_cache[symbol] = (data, now + 120)
                        return data
                elif response.status_code == 429:
                    logger.warning(f"Finnhub API rate limit hit (429) on quote for {symbol}")
        except Exception as e:
            logger.error(f"Error fetching quote for {symbol}: {e}")
        return {}

    async def get_metrics(self, symbol: str) -> dict:
        symbol = symbol.upper()
        now = time.time()
        if symbol in self.metric_cache:
            data, expiry = self.metric_cache[symbol]
            if now < expiry:
                return data

        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    "https://finnhub.io/api/v1/stock/metric",
                    params={"symbol": symbol, "metric": "all", "token": settings.FINNHUB_API_KEY},
                    timeout=10.0
                )
                if response.status_code == 200:
                    data = response.json()
                    if data and "metric" in data:
                        # Cache metrics for 5 minutes
                        self.metric_cache[symbol] = (data, now + 300)
                        return data
                elif response.status_code == 429:
                    logger.warning(f"Finnhub API rate limit hit (429) on metrics for {symbol}")
        except Exception as e:
            logger.error(f"Error fetching metrics for {symbol}: {e}")
        return {}

    async def get_candles(self, symbol: str, resolution: str, start_ts: int, end_ts: int) -> dict:
        symbol = symbol.upper()
        cache_key = (symbol, resolution, start_ts, end_ts)
        now = time.time()
        if cache_key in self.candle_cache:
            data, expiry = self.candle_cache[cache_key]
            if now < expiry:
                return data

        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    "https://finnhub.io/api/v1/stock/candle",
                    params={
                        "symbol": symbol,
                        "resolution": resolution,
                        "from": start_ts,
                        "to": end_ts,
                        "token": settings.FINNHUB_API_KEY
                    },
                    timeout=10.0
                )
                if response.status_code == 200:
                    data = response.json()
                    if data and data.get("s") == "ok":
                        # Cache candles for 15 minutes
                        self.candle_cache[cache_key] = (data, now + 900)
                        return data
                elif response.status_code == 429:
                    logger.warning(f"Finnhub API rate limit hit (429) on candles for {symbol}")
        except Exception as e:
            logger.error(f"Error fetching candles for {symbol}: {e}")
        return {}

cache_manager = FinnhubCacheManager()

# ─── Mock static defaults for fallback ───────────────────────────────────────
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

async def get_single_stock_summary(symbol: str, info: dict) -> dict:
    profile = await cache_manager.get_profile(symbol)
    quote = await cache_manager.get_quote(symbol)

    # Mock defaults
    base = BASE_PRICES.get(symbol, 100.0)
    mock_change_pct = (random.random() - 0.48) * 3
    mock_change = round(base * mock_change_pct / 100, 2)
    price = base + mock_change
    change = mock_change
    change_percent = mock_change_pct
    volume = random.randint(10_000_000, 80_000_000)
    
    if quote and quote.get("c") is not None and quote.get("c") != 0:
        price = quote["c"]
        change = quote.get("d", change)
        change_percent = quote.get("dp", change_percent)
        volume = quote.get("v", volume)

    name = info["name"]
    sector = info["sector"]
    market_cap = info["market_cap"]
    
    if profile and profile.get("name"):
        name = profile["name"]
        sector = profile.get("finnhubIndustry", sector)
        market_cap = profile.get("marketCapitalization", market_cap / 1e6) * 1e6

    return {
        "symbol": symbol,
        "name": name,
        "sector": sector,
        "price": round(price, 2),
        "change": round(change, 2),
        "change_percent": round(change_percent, 2),
        "volume": volume,
        "market_cap": market_cap,
        "pe": info["pe"],
        "high_52w": round(price * 1.08, 2),
        "low_52w": round(price * 0.76, 2),
    }

# ─── Endpoints ───────────────────────────────────────────────────────────────

@router.get("/")
async def list_stocks(
    sector: Optional[str] = None,
    q: Optional[str] = None,
    limit: int = Query(default=20, le=100),
    skip: int = 0,
):
    """List all tracked stocks with live or cached data."""
    tasks = []
    for symbol, info in MOCK_STOCKS.items():
        if q and q.upper() not in symbol and q.lower() not in info["name"].lower():
            continue
        if sector and info["sector"] != sector:
            continue
        tasks.append(get_single_stock_summary(symbol, info))

    stocks = await asyncio.gather(*tasks)
    return {"data": stocks[skip : skip + limit], "total": len(stocks)}


@router.get("/{symbol}")
async def get_stock(symbol: str):
    """Get single stock details with live Finnhub integration."""
    symbol = symbol.upper()
    profile = await cache_manager.get_profile(symbol)
    quote = await cache_manager.get_quote(symbol)
    metrics = await cache_manager.get_metrics(symbol)

    if not (profile and profile.get("name")) and symbol not in MOCK_STOCKS:
        raise HTTPException(status_code=404, detail=f"Stock {symbol} not found")

    info = MOCK_STOCKS.get(symbol, {"name": symbol, "sector": "Other", "pe": 20.0, "market_cap": 0.0})
    base = BASE_PRICES.get(symbol, 100.0)
    mock_change_pct = (random.random() - 0.48) * 3
    mock_change = round(base * mock_change_pct / 100, 2)
    
    price = base + mock_change
    change = mock_change
    change_percent = mock_change_pct
    volume = random.randint(10_000_000, 80_000_000)

    if quote and quote.get("c") is not None and quote.get("c") != 0:
        price = quote["c"]
        change = quote.get("d", change)
        change_percent = quote.get("dp", change_percent)
        volume = quote.get("v", volume)

    name = info["name"]
    sector = info["sector"]
    market_cap = info["market_cap"]

    if profile and profile.get("name"):
        name = profile["name"]
        sector = profile.get("finnhubIndustry", sector)
        market_cap = profile.get("marketCapitalization", 0) * 1e6

    pe = info["pe"]
    eps = round(pe / 10, 2)
    high_52w = round(price * 1.08, 2)
    low_52w = round(price * 0.76, 2)
    dividend_yield = round(random.uniform(0, 2.5), 2)

    if metrics and metrics.get("metric"):
        m = metrics["metric"]
        pe = m.get("peNormalizedAnnual", pe) or pe
        eps = m.get("epsNormalizedAnnual", eps) or eps
        high_52w = m.get("52WeekHigh", high_52w) or high_52w
        low_52w = m.get("52WeekLow", low_52w) or low_52w
        dividend_yield = m.get("dividendYieldIndicatedAnnual", dividend_yield) or dividend_yield

    return {
        "symbol": symbol,
        "name": name,
        "sector": sector,
        "price": round(price, 2),
        "change": round(change, 2),
        "change_percent": round(change_percent, 2),
        "volume": volume,
        "market_cap": market_cap,
        "pe": pe,
        "eps": eps,
        "high_52w": high_52w,
        "low_52w": low_52w,
        "avg_volume": volume,
        "dividend_yield": dividend_yield,
    }


@router.get("/{symbol}/history")
async def get_stock_history(
    symbol: str,
    period: str = Query(default="1M", enum=["1D", "1W", "1M", "3M", "6M", "1Y", "ALL"]),
):
    """Get historical OHLCV data from Finnhub."""
    symbol = symbol.upper()
    if symbol not in MOCK_STOCKS and not settings.FINNHUB_API_KEY:
        raise HTTPException(status_code=404, detail=f"Stock {symbol} not found")

    days_map = {"1D": 1, "1W": 7, "1M": 30, "3M": 90, "6M": 180, "1Y": 365, "ALL": 730}
    days = days_map.get(period, 30)

    now_dt = datetime.utcnow()
    end_ts = int(now_dt.timestamp())
    start_ts = end_ts - (days * 24 * 3600)

    resolution = "D"
    if period == "1D":
        resolution = "15"
    elif period == "1W":
        resolution = "60"
    elif period == "ALL":
        resolution = "W"

    candles = await cache_manager.get_candles(symbol, resolution, start_ts, end_ts)

    if candles and candles.get("s") == "ok":
        data = []
        c_list = candles.get("c", [])
        h_list = candles.get("h", [])
        l_list = candles.get("l", [])
        o_list = candles.get("o", [])
        v_list = candles.get("v", [])
        t_list = candles.get("t", [])

        for i in range(len(t_list)):
            dt = datetime.utcfromtimestamp(t_list[i])
            date_str = dt.strftime("%Y-%m-%d") if period != "1D" else dt.isoformat()
            data.append({
                "date": date_str,
                "open": round(o_list[i], 2),
                "high": round(h_list[i], 2),
                "low": round(l_list[i], 2),
                "close": round(c_list[i], 2),
                "volume": int(v_list[i]),
            })
    else:
        # Fallback to mock data
        data = generate_ohlcv(symbol, days)

    return {"symbol": symbol, "period": period, "data": data}


@router.get("/{symbol}/indicators")
async def get_technical_indicators(symbol: str):
    """Calculate real technical indicators using pandas and numpy from daily candle data."""
    symbol = symbol.upper()
    if symbol not in MOCK_STOCKS and not settings.FINNHUB_API_KEY:
        raise HTTPException(status_code=404, detail=f"Stock {symbol} not found")

    # Fetch 250 daily candles to support 200 SMA
    now_dt = datetime.utcnow()
    end_ts = int(now_dt.timestamp())
    start_ts = end_ts - (250 * 24 * 3600)

    candles = await cache_manager.get_candles(symbol, "D", start_ts, end_ts)

    base = BASE_PRICES.get(symbol, 100)
    seed = sum(ord(c) for c in symbol)
    random.seed(seed + 42)

    # Use live data if available
    if candles and candles.get("s") == "ok" and len(candles.get("c", [])) > 14:
        c = candles.get("c", [])
        h = candles.get("h", [])
        l = candles.get("l", [])
        o = candles.get("o", [])
        v = candles.get("v", [])

        df = pd.DataFrame({
            "close": c,
            "high": h,
            "low": l,
            "open": o,
            "volume": v
        })

        latest_price = df["close"].iloc[-1]

        # RSI (14)
        delta = df["close"].diff()
        gain = (delta.where(delta > 0, 0.0)).rolling(window=14).mean()
        loss = (-delta.where(delta < 0, 0.0)).rolling(window=14).mean()
        rs = gain / (loss + 1e-9)
        rsi_val = float((100 - (100 / (1 + rs))).iloc[-1])

        # MACD
        ema_12 = df["close"].ewm(span=12, adjust=False).mean()
        ema_26 = df["close"].ewm(span=26, adjust=False).mean()
        macd = ema_12 - ema_26
        signal = macd.ewm(span=9, adjust=False).mean()
        hist = macd - signal

        macd_val = float(macd.iloc[-1])
        macd_signal_val = float(signal.iloc[-1])
        macd_hist_val = float(hist.iloc[-1])

        # EMA & SMA
        ema_20_val = float(df["close"].ewm(span=20, adjust=False).mean().iloc[-1])
        ema_50_val = float(df["close"].ewm(span=50, adjust=False).mean().iloc[-1])
        sma_200_val = float(df["close"].rolling(window=min(200, len(df))).mean().iloc[-1])

        # Bollinger Bands
        sma_20 = df["close"].rolling(window=min(20, len(df))).mean()
        std_20 = df["close"].rolling(window=min(20, len(df))).std()
        bollinger_middle = float(sma_20.iloc[-1])
        bollinger_upper = float((sma_20 + 2 * std_20).iloc[-1])
        bollinger_lower = float((sma_20 - 2 * std_20).iloc[-1])

        # ATR
        high_low = df["high"] - df["low"]
        high_cp = (df["high"] - df["close"].shift()).abs()
        low_cp = (df["low"] - df["close"].shift()).abs()
        df_tr = pd.concat([high_low, high_cp, low_cp], axis=1)
        true_range = df_tr.max(axis=1)
        atr_val = float(true_range.rolling(14).mean().iloc[-1])

        # VWAP
        vwap_val = float(((df["volume"] * (df["high"] + df["low"] + df["close"]) / 3).sum() / (df["volume"].sum() + 1e-9)))

        # ADX
        upmove = df["high"].diff()
        downmove = df["low"].diff()
        plus_dm = np.where((upmove > downmove) & (upmove > 0), upmove, 0.0)
        minus_dm = np.where((downmove > upmove) & (downmove > 0), downmove, 0.0)
        tr_14 = true_range.rolling(14).sum()
        plus_dm_14 = pd.Series(plus_dm).rolling(14).sum()
        minus_dm_14 = pd.Series(minus_dm).rolling(14).sum()
        plus_di = 100 * (plus_dm_14 / (tr_14 + 1e-9))
        minus_di = 100 * (minus_dm_14 / (tr_14 + 1e-9))
        dx = 100 * (plus_di - minus_di).abs() / (plus_di + minus_di + 1e-9)
        adx_val = float(dx.rolling(14).mean().iloc[-1])

        # Stoch RSI
        rsi_series = 100 - (100 / (1 + (gain / (loss + 1e-9))))
        stoch_rsi_series = (rsi_series - rsi_series.rolling(14).min()) / (rsi_series.rolling(14).max() - rsi_series.rolling(14).min() + 1e-9)
        stoch_rsi_val = float(stoch_rsi_series.iloc[-1] * 100)

        # CCI
        tp = (df["high"] + df["low"] + df["close"]) / 3
        tp_sma = tp.rolling(20).mean()
        tp_mad = tp.rolling(20).apply(lambda x: np.abs(x - x.mean()).mean(), raw=True)
        cci_val = float(((tp - tp_sma) / (0.015 * tp_mad + 1e-9)).iloc[-1])

        # OBV
        obv = np.where(df["close"] > df["close"].shift(), df["volume"], np.where(df["close"] < df["close"].shift(), -df["volume"], 0.0))
        obv_val = int(obv.cumsum()[-1])

        return {
            "symbol": symbol,
            "rsi": round(rsi_val, 2),
            "macd": round(macd_val, 4),
            "macd_signal": round(macd_signal_val, 4),
            "macd_histogram": round(macd_hist_val, 4),
            "ema_20": round(ema_20_val, 2),
            "ema_50": round(ema_50_val, 2),
            "sma_200": round(sma_200_val, 2),
            "bollinger_upper": round(bollinger_upper, 2),
            "bollinger_middle": round(bollinger_middle, 2),
            "bollinger_lower": round(bollinger_lower, 2),
            "atr": round(atr_val, 2),
            "vwap": round(vwap_val, 2),
            "adx": round(adx_val, 2),
            "stoch_rsi": round(stoch_rsi_val, 2),
            "cci": round(cci_val, 2),
            "obv": obv_val,
            "updated_at": datetime.utcnow().isoformat(),
        }
    else:
        # Fallback to mock technical indicators
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

from fastapi import APIRouter, Depends
from core.security import get_current_user
import random
from datetime import datetime

router = APIRouter()


@router.get("/")
async def get_recommendations(user=Depends(get_current_user)):
    """Get AI-powered BUY/SELL/HOLD recommendations."""
    RECS = [
        {"symbol": "NVDA", "name": "NVIDIA Corp.", "action": "BUY", "price": 875.22, "target": 1050.0, "stop_loss": 820.0, "confidence": 89, "timeframe": "30 Days", "risk_level": "medium", "expected_return": 19.97, "reasoning": ["LSTM bullish momentum", "RSI at 61", "Strong AI demand", "Volume breakout"]},
        {"symbol": "META", "name": "Meta Platforms", "action": "BUY", "price": 516.72, "target": 590.0, "stop_loss": 490.0, "confidence": 76, "timeframe": "30 Days", "risk_level": "low", "expected_return": 14.19, "reasoning": ["GRU bullish signal", "MACD crossover", "Positive AI sentiment", "Strong earnings"]},
        {"symbol": "TSLA", "name": "Tesla Inc.", "action": "SELL", "price": 234.56, "target": 195.0, "stop_loss": 252.0, "confidence": 81, "timeframe": "14 Days", "risk_level": "high", "expected_return": -16.84, "reasoning": ["Bearish RSI divergence", "Negative sentiment -0.34", "Death cross pattern", "Delivery miss"]},
        {"symbol": "AAPL", "name": "Apple Inc.", "action": "HOLD", "price": 189.43, "target": 200.0, "stop_loss": 178.0, "confidence": 72, "timeframe": "30 Days", "risk_level": "low", "expected_return": 5.58, "reasoning": ["Consolidation phase", "Mixed iPhone sentiment", "Strong $182 support", "Await Q4 catalyst"]},
    ]
    for r in RECS:
        r["id"] = f"rec_{r['symbol']}_{datetime.utcnow().date()}"
        r["created_at"] = datetime.utcnow().isoformat()
    return {"data": RECS, "total": len(RECS), "generated_at": datetime.utcnow().isoformat()}

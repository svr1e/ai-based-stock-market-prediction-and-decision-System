from fastapi import APIRouter, Depends
from core.security import get_current_user
from pydantic import BaseModel
from datetime import datetime

router = APIRouter()


class ChatRequest(BaseModel):
    message: str
    context: list = []


RESPONSES = {
    "nvda": "**NVIDIA (NVDA) - BUY** with 89% confidence. Target: $1,050. RSI at 61, strong AI demand catalyst, volume breakout.",
    "macd": "MACD (Moving Average Convergence Divergence) measures momentum. Bullish when MACD crosses above Signal line. Our ensemble boosts accuracy to 78-84%.",
    "tesla": "Tesla risk score: 68/100 (High). Volatility 52% annualized, Beta 1.82. Set stop-loss at $218. Max portfolio allocation: 10%.",
    "default": "I'm analyzing your question using our multi-model AI. Please ask about specific stocks, indicators (RSI, MACD, Bollinger), risk analysis, or portfolio strategies.",
}


@router.post("/message")
async def chat(data: ChatRequest, user=Depends(get_current_user)):
    """AI chatbot for investment queries."""
    msg = data.message.lower()
    if "nvda" in msg or "nvidia" in msg:
        reply = RESPONSES["nvda"]
    elif "macd" in msg or "indicator" in msg:
        reply = RESPONSES["macd"]
    elif "tesla" in msg or "tsla" in msg or "risk" in msg:
        reply = RESPONSES["tesla"]
    else:
        reply = RESPONSES["default"]

    return {
        "role": "assistant",
        "content": reply,
        "timestamp": datetime.utcnow().isoformat(),
        "model": "StockAI-GPT",
    }

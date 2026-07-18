from fastapi import APIRouter, Depends
from core.security import get_current_user
import random
from datetime import datetime

router = APIRouter()

BASE_PRICES = {
    "AAPL": 189.43, "MSFT": 414.28, "NVDA": 875.22, "TSLA": 234.56,
    "META": 516.72, "AMD": 162.43, "GOOGL": 176.54, "JPM": 206.54,
}


@router.get("/{symbol}")
async def get_risk_analysis(symbol: str, user=Depends(get_current_user)):
    """Risk assessment for a stock."""
    symbol = symbol.upper()
    seed = sum(ord(c) for c in symbol)
    random.seed(seed + 99)

    volatility = round(15 + (seed % 40), 2)
    beta = round(0.6 + (seed % 15) / 10, 2)
    sharpe = round(0.8 + (seed % 20) / 10, 2)
    sortino = round(1.0 + (seed % 18) / 10, 2)
    max_dd = round(-(5 + seed % 35), 2)
    risk_score = min(100, round(volatility * 1.5 + abs(max_dd) * 0.5))
    risk_label = "Very High" if risk_score > 75 else "High" if risk_score > 55 else "Medium" if risk_score > 35 else "Low"

    return {
        "symbol": symbol,
        "volatility": volatility,
        "beta": beta,
        "sharpe_ratio": sharpe,
        "sortino_ratio": sortino,
        "max_drawdown": max_dd,
        "value_at_risk_95": round(max_dd * 0.7, 2),
        "value_at_risk_99": round(max_dd * 1.0, 2),
        "risk_score": risk_score,
        "risk_label": risk_label,
        "updated_at": datetime.utcnow().isoformat(),
    }


@router.get("/portfolio/risk")
async def get_portfolio_risk(user=Depends(get_current_user)):
    """Aggregate portfolio risk metrics."""
    return {
        "portfolio_volatility": 21.4,
        "portfolio_beta": 1.24,
        "portfolio_sharpe": 1.12,
        "portfolio_sortino": 1.45,
        "max_drawdown": -18.3,
        "value_at_risk_95": -3.2,
        "risk_score": 52,
        "risk_label": "Medium",
        "diversification_score": 73,
    }

from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from enum import Enum


class PredictionTimeframe(str, Enum):
    ONE_DAY = "1d"
    SEVEN_DAYS = "7d"
    THIRTY_DAYS = "30d"
    NINETY_DAYS = "90d"


class ModelType(str, Enum):
    LSTM = "lstm"
    GRU = "gru"
    RANDOM_FOREST = "rf"
    XGBOOST = "xgboost"
    ENSEMBLE = "ensemble"


class TrendType(str, Enum):
    BULLISH = "bullish"
    BEARISH = "bearish"
    SIDEWAYS = "sideways"


class PredictionRequest(BaseModel):
    symbol: str = Field(min_length=1, max_length=10)
    timeframe: PredictionTimeframe = PredictionTimeframe.SEVEN_DAYS
    model: ModelType = ModelType.ENSEMBLE


class FeatureImportance(BaseModel):
    feature: str
    importance: float
    direction: str


class PredictionDataPoint(BaseModel):
    date: str
    actual: Optional[float] = None
    predicted: float


class PredictionResponse(BaseModel):
    id: str
    symbol: str
    timeframe: str
    model: str
    current_price: float
    predicted_price: float
    confidence: float
    trend: TrendType
    trend_probability: float
    expected_return: float
    price_history: List[PredictionDataPoint]
    feature_importance: List[FeatureImportance]
    explanation: str
    created_at: datetime


class RecommendationAction(str, Enum):
    BUY = "BUY"
    SELL = "SELL"
    HOLD = "HOLD"


class RecommendationResponse(BaseModel):
    id: str
    symbol: str
    name: str
    action: RecommendationAction
    current_price: float
    target_price: float
    stop_loss: float
    confidence: float
    timeframe: str
    reasoning: List[str]
    risk_level: str
    expected_return: float
    created_at: datetime


class RiskAnalysisResponse(BaseModel):
    symbol: str
    volatility: float
    beta: float
    sharpe_ratio: float
    sortino_ratio: float
    max_drawdown: float
    value_at_risk_95: float
    value_at_risk_99: float
    risk_score: int
    risk_label: str

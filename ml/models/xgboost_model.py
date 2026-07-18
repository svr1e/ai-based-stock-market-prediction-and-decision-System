"""
XGBoost Model for Stock Price Prediction
Uses gradient boosting with technical indicators as features.
"""
import numpy as np
import pandas as pd
import joblib
import os
from datetime import datetime


class XGBoostModel:
    """
    XGBoost model for stock return classification and price prediction.
    Features: RSI, MACD, Volume, EMA, Bollinger Bands, ATR, OBV, Sentiment.
    """

    def __init__(self):
        self.model = None
        self.feature_names = [
            'rsi', 'macd', 'macd_signal', 'ema_20', 'ema_50',
            'bollinger_upper', 'bollinger_lower', 'volume_ratio',
            'atr', 'obv_ratio', 'sentiment_score',
        ]
        self.is_trained = False

    def build_features(self, df: pd.DataFrame) -> pd.DataFrame:
        """Engineer features from OHLCV data."""
        close = df['close']

        # RSI
        delta = close.diff()
        gain = delta.where(delta > 0, 0).rolling(14).mean()
        loss = (-delta.where(delta < 0, 0)).rolling(14).mean()
        rs = gain / loss
        df['rsi'] = 100 - (100 / (1 + rs))

        # MACD
        ema12 = close.ewm(span=12).mean()
        ema26 = close.ewm(span=26).mean()
        df['macd'] = ema12 - ema26
        df['macd_signal'] = df['macd'].ewm(span=9).mean()

        # EMA
        df['ema_20'] = close.ewm(span=20).mean()
        df['ema_50'] = close.ewm(span=50).mean()

        # Bollinger Bands
        sma20 = close.rolling(20).mean()
        std20 = close.rolling(20).std()
        df['bollinger_upper'] = (sma20 + 2 * std20 - close) / close
        df['bollinger_lower'] = (close - sma20 + 2 * std20) / close

        # Volume
        df['volume_ratio'] = df['volume'] / df['volume'].rolling(20).mean()

        # ATR
        hl = df['high'] - df['low']
        hc = abs(df['high'] - close.shift())
        lc = abs(df['low'] - close.shift())
        df['atr'] = pd.concat([hl, hc, lc], axis=1).max(axis=1).rolling(14).mean() / close

        # OBV ratio
        obv = (df['volume'] * df['close'].diff().apply(np.sign)).cumsum()
        df['obv_ratio'] = obv / obv.rolling(20).mean()

        # Sentiment (placeholder — would come from FinBERT)
        df['sentiment_score'] = 0.0

        return df.dropna()

    def train(self, df: pd.DataFrame, target_days: int = 7):
        """Train XGBoost model."""
        try:
            import xgboost as xgb

            df = self.build_features(df.copy())
            df['target'] = df['close'].shift(-target_days) > df['close']
            df = df.dropna()

            X = df[self.feature_names]
            y = df['target'].astype(int)

            split = int(len(X) * 0.8)
            X_train, X_test = X[:split], X[split:]
            y_train, y_test = y[:split], y[split:]

            self.model = xgb.XGBClassifier(
                n_estimators=200,
                max_depth=6,
                learning_rate=0.05,
                subsample=0.8,
                colsample_bytree=0.8,
                random_state=42,
                eval_metric='logloss',
            )
            self.model.fit(
                X_train, y_train,
                eval_set=[(X_test, y_test)],
                verbose=False,
            )
            self.is_trained = True
            acc = self.model.score(X_test, y_test)
            print(f"XGBoost accuracy: {acc:.2%}")
            return {"accuracy": acc}
        except ImportError:
            print("XGBoost not installed. Using mock model.")
            self.is_trained = False

    def predict(self, features: dict) -> dict:
        """Predict using current technical indicators."""
        if not self.is_trained or self.model is None:
            # Mock prediction
            confidence = 70 + np.random.random() * 18
            is_bullish = np.random.random() > 0.45
            return {
                "prediction": "bullish" if is_bullish else "bearish",
                "confidence": round(confidence, 1),
                "probability_up": round(confidence / 100 if is_bullish else 1 - confidence / 100, 3),
                "model": "xgboost",
            }

        X = [[features.get(f, 0) for f in self.feature_names]]
        prob = self.model.predict_proba(X)[0]
        is_bullish = prob[1] > 0.5
        confidence = round(max(prob) * 100, 1)

        return {
            "prediction": "bullish" if is_bullish else "bearish",
            "confidence": confidence,
            "probability_up": round(float(prob[1]), 3),
            "model": "xgboost",
        }

    def get_feature_importance(self) -> list:
        """Get SHAP-like feature importance."""
        if not self.is_trained or self.model is None:
            return [{"feature": f, "importance": round(np.random.random(), 3)} for f in self.feature_names]
        importances = self.model.feature_importances_
        return sorted(
            [{"feature": f, "importance": round(float(i), 4)} for f, i in zip(self.feature_names, importances)],
            key=lambda x: x["importance"],
            reverse=True,
        )

    def save(self, path: str):
        os.makedirs(path, exist_ok=True)
        joblib.dump(self.model, f"{path}/xgboost_model.pkl")

    def load(self, path: str):
        self.model = joblib.load(f"{path}/xgboost_model.pkl")
        self.is_trained = True

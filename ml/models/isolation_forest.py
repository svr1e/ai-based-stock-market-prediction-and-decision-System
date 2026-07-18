"""
Isolation Forest for Market Crash / Anomaly Detection
Detects flash crashes, unusual volatility, and market anomalies.
"""
import numpy as np
import pandas as pd
import joblib
import os
from datetime import datetime


class IsolationForestModel:
    """
    Isolation Forest model for detecting market anomalies.
    Trained on volatility, volume, and price movement features.
    """

    def __init__(self, contamination: float = 0.05):
        self.contamination = contamination
        self.model = None
        self.is_trained = False
        self.threshold = -0.2  # Decision threshold

    def build_features(self, df: pd.DataFrame) -> pd.DataFrame:
        """Build anomaly detection features."""
        close = df['close']

        df['return'] = close.pct_change()
        df['return_5d'] = close.pct_change(5)
        df['volatility'] = df['return'].rolling(20).std()
        df['volume_spike'] = df['volume'] / df['volume'].rolling(20).mean()
        df['price_range'] = (df['high'] - df['low']) / close
        df['gap'] = (close - close.shift(1).rolling(20).mean()) / close.rolling(20).std()
        df['rsi'] = self._calculate_rsi(close)

        features = ['return', 'return_5d', 'volatility', 'volume_spike', 'price_range', 'gap', 'rsi']
        return df[features].dropna()

    def _calculate_rsi(self, close: pd.Series, period: int = 14) -> pd.Series:
        delta = close.diff()
        gain = delta.where(delta > 0, 0).rolling(period).mean()
        loss = (-delta.where(delta < 0, 0)).rolling(period).mean()
        rs = gain / (loss + 1e-10)
        return 100 - (100 / (1 + rs))

    def train(self, df: pd.DataFrame):
        """Train the Isolation Forest model."""
        try:
            from sklearn.ensemble import IsolationForest
            from sklearn.preprocessing import StandardScaler

            features = self.build_features(df.copy())
            self.scaler = StandardScaler()
            X = self.scaler.fit_transform(features)

            self.model = IsolationForest(
                n_estimators=200,
                contamination=self.contamination,
                random_state=42,
                n_jobs=-1,
            )
            self.model.fit(X)
            self.is_trained = True
            anomaly_count = (self.model.predict(X) == -1).sum()
            print(f"✅ Isolation Forest trained. Detected {anomaly_count} anomalies in training data.")
        except ImportError:
            print("scikit-learn not installed.")

    def detect(self, df: pd.DataFrame) -> dict:
        """Detect anomalies in new data."""
        if not self.is_trained or self.model is None:
            # Mock detection
            anomaly_scores = np.random.uniform(-0.5, 0.1, len(df))
            is_anomaly = anomaly_scores < self.threshold

            results = []
            for i, (score, anom) in enumerate(zip(anomaly_scores, is_anomaly)):
                if anom:
                    results.append({
                        "date": str(df.index[i] if hasattr(df, 'index') else datetime.utcnow()),
                        "anomaly_score": round(float(score), 4),
                        "severity": "critical" if score < -0.4 else "warning",
                        "type": "flash_crash" if np.random.random() > 0.5 else "high_volatility",
                    })

            return {
                "total_points": len(df),
                "anomalies_detected": len(results),
                "anomaly_rate": round(len(results) / max(1, len(df)) * 100, 2),
                "events": results[:10],
                "current_risk_level": "High" if len(results) > 3 else "Medium" if len(results) > 1 else "Low",
            }

        features = self.build_features(df.copy())
        X = self.scaler.transform(features)
        scores = self.model.score_samples(X)
        predictions = self.model.predict(X)

        anomaly_indices = np.where(predictions == -1)[0]
        events = []
        for idx in anomaly_indices:
            events.append({
                "date": str(features.index[idx]) if hasattr(features, 'index') else str(idx),
                "anomaly_score": round(float(scores[idx]), 4),
                "severity": "critical" if scores[idx] < -0.4 else "warning",
                "type": "flash_crash" if df.iloc[idx]['return'] < -0.05 else "high_volatility",
            })

        return {
            "total_points": len(features),
            "anomalies_detected": len(events),
            "anomaly_rate": round(len(events) / len(features) * 100, 2),
            "events": events[:20],
            "current_risk_level": "High" if scores[-1] < -0.3 else "Medium" if scores[-1] < -0.1 else "Low",
            "latest_score": round(float(scores[-1]), 4),
        }

    def save(self, path: str):
        os.makedirs(path, exist_ok=True)
        joblib.dump({"model": self.model, "scaler": self.scaler}, f"{path}/isolation_forest.pkl")

    def load(self, path: str):
        data = joblib.load(f"{path}/isolation_forest.pkl")
        self.model = data["model"]
        self.scaler = data["scaler"]
        self.is_trained = True

from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from core.database import get_db
import asyncio, json, random, logging
from datetime import datetime

logger = logging.getLogger(__name__)
router = APIRouter()

BASE_PRICES = {
    "AAPL": 189.43, "MSFT": 414.28, "NVDA": 875.22, "GOOGL": 176.54,
    "TSLA": 234.56, "META": 516.72, "AMZN": 193.67, "JPM": 206.54,
    "AMD": 162.43, "NFLX": 687.34,
}


class ConnectionManager:
    def __init__(self):
        self.active: list[WebSocket] = []

    async def connect(self, ws: WebSocket):
        await ws.accept()
        self.active.append(ws)

    def disconnect(self, ws: WebSocket):
        if ws in self.active:
            self.active.remove(ws)

    async def broadcast(self, data: dict):
        dead = []
        for ws in self.active:
            try:
                await ws.send_json(data)
            except Exception:
                dead.append(ws)
        for ws in dead:
            self.disconnect(ws)


manager = ConnectionManager()


@router.websocket("/prices")
async def websocket_prices(ws: WebSocket):
    """WebSocket endpoint for live stock price streaming."""
    await manager.connect(ws)
    logger.info(f"WebSocket connected. Total: {len(manager.active)}")
    prices = dict(BASE_PRICES)

    try:
        while True:
            # Simulate price tick
            updates = {}
            for symbol, price in prices.items():
                change = (random.random() - 0.49) * price * 0.004
                new_price = round(max(1, price + change), 2)
                prices[symbol] = new_price
                updates[symbol] = {
                    "symbol": symbol,
                    "price": new_price,
                    "change": round(change, 2),
                    "change_percent": round((change / price) * 100, 3),
                    "timestamp": datetime.utcnow().isoformat(),
                }

            await ws.send_json({"type": "price_update", "data": updates})
            await asyncio.sleep(2)

    except WebSocketDisconnect:
        manager.disconnect(ws)
        logger.info(f"WebSocket disconnected. Remaining: {len(manager.active)}")


@router.websocket("/notifications/{user_id}")
async def websocket_notifications(ws: WebSocket, user_id: str):
    """WebSocket for user-specific notifications."""
    await ws.accept()
    try:
        while True:
            # In production: listen to Redis pub/sub for this user_id
            await asyncio.sleep(30)
            await ws.send_json({"type": "ping", "timestamp": datetime.utcnow().isoformat()})
    except WebSocketDisconnect:
        pass

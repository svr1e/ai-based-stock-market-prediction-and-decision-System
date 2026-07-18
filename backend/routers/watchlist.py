from fastapi import APIRouter, Depends
from core.database import get_db
from core.security import get_current_user
from datetime import datetime
import uuid

router = APIRouter()


@router.get("/")
async def get_watchlist(user=Depends(get_current_user)):
    db = get_db()
    items = []
    async for item in db.watchlist.find({"user_id": str(user["_id"])}):
        item["id"] = str(item.pop("_id"))
        items.append(item)
    return {"data": items, "total": len(items)}


@router.post("/")
async def add_to_watchlist(data: dict, user=Depends(get_current_user)):
    db = get_db()
    symbol = data.get("symbol", "").upper()
    if not symbol:
        from fastapi import HTTPException
        raise HTTPException(status_code=400, detail="Symbol required")
    item = {
        "_id": str(uuid.uuid4()),
        "user_id": str(user["_id"]),
        "symbol": symbol,
        "name": data.get("name", symbol),
        "alert_price": data.get("alert_price"),
        "alert_type": data.get("alert_type"),
        "added_at": datetime.utcnow().isoformat(),
    }
    await db.watchlist.insert_one(item)
    item["id"] = item.pop("_id")
    return item


@router.delete("/{item_id}")
async def remove_from_watchlist(item_id: str, user=Depends(get_current_user)):
    db = get_db()
    await db.watchlist.delete_one({"_id": item_id, "user_id": str(user["_id"])})
    return {"message": "Removed from watchlist"}

from fastapi import APIRouter, Depends
from core.database import get_db
from core.security import get_current_user
from datetime import datetime

router = APIRouter()


@router.get("/")
async def get_notifications(limit: int = 20, user=Depends(get_current_user)):
    db = get_db()
    items = []
    async for n in db.notifications.find({"user_id": str(user["_id"])}).sort("created_at", -1).limit(limit):
        n["id"] = str(n.pop("_id"))
        items.append(n)
    return {"data": items, "unread": sum(1 for n in items if not n.get("read"))}


@router.patch("/{notif_id}/read")
async def mark_read(notif_id: str, user=Depends(get_current_user)):
    db = get_db()
    await db.notifications.update_one(
        {"_id": notif_id, "user_id": str(user["_id"])},
        {"$set": {"read": True, "read_at": datetime.utcnow()}},
    )
    return {"message": "Marked as read"}


@router.patch("/read-all")
async def mark_all_read(user=Depends(get_current_user)):
    db = get_db()
    await db.notifications.update_many(
        {"user_id": str(user["_id"]), "read": False},
        {"$set": {"read": True, "read_at": datetime.utcnow()}},
    )
    return {"message": "All notifications marked as read"}

from fastapi import APIRouter, HTTPException, Depends
from core.database import get_db
from core.security import get_current_user
from datetime import datetime
import uuid

router = APIRouter()


@router.get("/")
async def get_portfolio(user=Depends(get_current_user)):
    """Get user portfolio."""
    db = get_db()
    portfolio = await db.portfolio.find_one({"user_id": str(user["_id"])})

    if not portfolio:
        portfolio = {
            "_id": str(uuid.uuid4()),
            "user_id": str(user["_id"]),
            "holdings": [],
            "created_at": datetime.utcnow(),
        }
        await db.portfolio.insert_one(portfolio)

    holdings = portfolio.get("holdings", [])
    total_value = sum(h.get("current_value", 0) for h in holdings)
    total_cost = sum(h.get("total_cost", 0) for h in holdings)
    total_pnl = total_value - total_cost
    total_pnl_pct = (total_pnl / total_cost * 100) if total_cost > 0 else 0

    return {
        "total_value": round(total_value, 2),
        "total_cost": round(total_cost, 2),
        "total_pnl": round(total_pnl, 2),
        "total_pnl_percent": round(total_pnl_pct, 2),
        "holdings": holdings,
        "holdings_count": len(holdings),
    }


@router.post("/holdings")
async def add_holding(
    data: dict,
    user=Depends(get_current_user),
):
    """Add a stock holding to portfolio."""
    db = get_db()
    required = ["symbol", "quantity", "avg_cost", "current_price"]
    for field in required:
        if field not in data:
            raise HTTPException(status_code=400, detail=f"Missing field: {field}")

    symbol = data["symbol"].upper()
    quantity = float(data["quantity"])
    avg_cost = float(data["avg_cost"])
    current_price = float(data["current_price"])

    total_cost = round(avg_cost * quantity, 2)
    current_value = round(current_price * quantity, 2)
    pnl = round(current_value - total_cost, 2)
    pnl_percent = round((pnl / total_cost) * 100, 2) if total_cost > 0 else 0

    holding = {
        "id": str(uuid.uuid4()),
        "symbol": symbol,
        "name": data.get("name", symbol),
        "quantity": quantity,
        "avg_cost": avg_cost,
        "current_price": current_price,
        "total_cost": total_cost,
        "current_value": current_value,
        "pnl": pnl,
        "pnl_percent": pnl_percent,
        "sector": data.get("sector", "Unknown"),
        "added_at": datetime.utcnow().isoformat(),
    }

    # Record transaction
    await db.transactions.insert_one({
        "_id": str(uuid.uuid4()),
        "user_id": str(user["_id"]),
        "type": "BUY",
        "symbol": symbol,
        "quantity": quantity,
        "price": avg_cost,
        "total": total_cost,
        "created_at": datetime.utcnow(),
    })

    result = await db.portfolio.update_one(
        {"user_id": str(user["_id"])},
        {"$push": {"holdings": holding}},
        upsert=True,
    )

    return {"message": "Holding added", "holding": holding}


@router.delete("/holdings/{holding_id}")
async def remove_holding(holding_id: str, user=Depends(get_current_user)):
    """Remove a holding from portfolio."""
    db = get_db()
    result = await db.portfolio.update_one(
        {"user_id": str(user["_id"])},
        {"$pull": {"holdings": {"id": holding_id}}},
    )
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Holding not found")
    return {"message": "Holding removed"}


@router.get("/transactions")
async def get_transactions(limit: int = 50, user=Depends(get_current_user)):
    """Get transaction history."""
    db = get_db()
    cursor = db.transactions.find({"user_id": str(user["_id"])}).sort("created_at", -1).limit(limit)
    txns = []
    async for t in cursor:
        t["id"] = str(t.pop("_id"))
        txns.append(t)
    return {"data": txns, "total": len(txns)}

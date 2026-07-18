from fastapi import APIRouter
router = APIRouter()

@router.get("/{symbol}")
async def get_analytics(symbol: str):
    return {"symbol": symbol.upper(), "status": "analytics endpoint"}

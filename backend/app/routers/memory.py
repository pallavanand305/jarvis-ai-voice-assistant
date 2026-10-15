from fastapi import APIRouter
from .. import memory as db

router = APIRouter()

@router.get("/")
async def get_history(limit: int = 20):
    return {"history": db.get_history(limit=limit)}

@router.delete("/")
async def clear_history():
    db.clear_history()
    return {"status": "cleared"}

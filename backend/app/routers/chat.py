from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from ..services.llm import llm
from .. import memory as db
from typing import List, Dict

router = APIRouter()

class ChatRequest(BaseModel):
    message: str
    language: str = "auto"
    history: List[Dict[str, str]] = []

class ChatResponse(BaseModel):
    response: str
    language: str

@router.post("/", response_model=ChatResponse)
async def chat(req: ChatRequest):
    if not req.message.strip():
        raise HTTPException(status_code=400, detail="message is required")
    history = req.history[-10:]
    history.append({"role": "user", "content": req.message})
    reply = llm.generate(history)
    db.save_conversation(req.message, reply, req.language)
    return ChatResponse(response=reply, language=req.language)

@router.get("/history")
async def history(limit: int = 20):
    return {"history": db.get_history(limit=limit)}


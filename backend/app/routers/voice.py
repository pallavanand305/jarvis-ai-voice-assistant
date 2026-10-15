from fastapi import APIRouter, UploadFile, File, HTTPException
from fastapi.responses import Response
from ..services.stt import stt
from ..services.tts import tts
from ..services.llm import llm
from .. import memory as db
from pydantic import BaseModel
from typing import List, Dict

router = APIRouter()

class SpeakRequest(BaseModel):
    text: str
    lang: str = "en"

@router.post("/stt")
async def speech_to_text(file: UploadFile = File(...)):
    data = await file.read()
    if not data:
        raise HTTPException(status_code=400, detail="empty audio file")
    try:
        text = stt.transcribe(data, suffix=".wav")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"transcription failed: {e}")
    return {"text": text}

@router.post("/tts")
async def text_to_speech(req: SpeakRequest):
    if not req.text.strip():
        raise HTTPException(status_code=400, detail="text is required")
    try:
        audio = tts.synth(req.text, lang=req.lang)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"synthesis failed: {e}")
    return Response(content=audio, media_type="audio/mpeg")

class VoiceChatRequest(BaseModel):
    audio: bytes
    language: str = "auto"
    history: List[Dict[str, str]] = []

@router.post("/chat")
async def voice_chat(file: UploadFile = File(...), language: str = "auto"):
    data = await file.read()
    if not data:
        raise HTTPException(status_code=400, detail="empty audio file")
    try:
        text = stt.transcribe(data, suffix=".wav")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"transcription failed: {e}")
    history = [{"role": "user", "content": text}]
    reply = llm.generate(history)
    db.save_conversation(text, reply, language)
    return {"transcript": text, "response": reply, "language": language}

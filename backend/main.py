from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.logging import setup_logging
from app.routers import chat, voice, memory, tools

setup_logging()

app = FastAPI(title=settings.APP_NAME, version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(chat.router, prefix="/api/chat", tags=["chat"])
app.include_router(voice.router, prefix="/api/voice", tags=["voice"])
app.include_router(memory.router, prefix="/api/memory", tags=["memory"])
app.include_router(tools.router, prefix="/api/tools", tags=["tools"])

@app.get("/")
async def root():
    return {"status": "ok", "app": settings.APP_NAME}


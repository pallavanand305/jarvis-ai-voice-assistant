from pydantic_settings import BaseSettings
from typing import List

class Settings(BaseSettings):
    APP_NAME: str = "Jarvis AI"
    ENV: str = "development"
    LOG_LEVEL: str = "INFO"
    LLM_PROVIDER: str = "openai"
    LLM_MODEL: str = "gpt-4o-mini"
    OPENAI_API_KEY: str | None = None
    WEATHER_API_KEY: str | None = None
    OPENWEATHERMAP_API_KEY: str | None = None
    WAKE_WORD: str = "hey jarvis"
    DATABASE_URL: str = "sqlite:///./jarvis.db"
    WHISPER_MODEL: str = "base"
    TTS_ENGINE: str = "edge-tts"
    TTS_VOICE: str = "en-US-AriaNeural"
    TTS_VOICE_HI: str = "hi-IN-SwaraNeural"
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    CORS_ORIGINS: List[str] = ["http://localhost:5173", "http://localhost:3000"]

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"

settings = Settings()

# Jarvis AI Voice Assistant

A Jarvis-style AI voice assistant with an animated anime avatar, Hindi/Hinglish/English support, real-time voice input/output, and modular tools.

## Tech Stack

| Component | Technology |
|-----------|-----------|
| Backend | Python + FastAPI |
| Speech-to-Text | faster-whisper |
| Text-to-Speech | Edge TTS (Hindi + English voices) |
| AI Brain | OpenAI API (configurable) |
| Frontend | React + TypeScript + Vite |
| Avatar | Animated SVG (idle/listening/thinking/speaking) |
| Database | SQLite (conversation history) |

## Features

- Real-time microphone input with voice responses
- Hindi, Hinglish and English conversations
- Animated anime-style avatar with synchronized states
- Text chat fallback
- Conversation memory with clear controls
- Modular tools: time, weather, web search
- Optional wake-word support ("Hey Jarvis")
- Secure API key management via environment variables
- Docker support, logging, error handling, automated tests

## Quick Start

### Local Development

**Backend:**
```bash
cd backend
pip install -r ../requirements.txt
cp ../.env.example ../.env   # then fill in your API keys
uvicorn main:app --reload --port 8000
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:5173

### Docker

```bash
cp .env.example .env   # fill in API keys
docker compose up --build
```

## Required API Keys

Edit `.env`:

| Key | Purpose | Required |
|-----|---------|----------|
| `OPENAI_API_KEY` | LLM responses | Yes (for real AI) |
| `OPENWEATHERMAP_API_KEY` | Weather tool | Optional |
| `WEATHER_API_KEY` | Weather fallback | Optional |

Without `OPENAI_API_KEY`, the system runs in fallback echo mode.

## Hardware / Manual Setup

- **Microphone permission**: Browser will prompt for mic access when you click the Mic button.
- **Audio playback**: Browser must allow autoplay for TTS responses (usually allowed after first interaction).
- **Hindi TTS**: Uses `hi-IN-SwaraNeural` voice via Edge TTS (requires internet).

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/chat/` | Text chat with LLM |
| GET | `/api/chat/history` | Conversation history |
| POST | `/api/voice/stt` | Speech-to-text (file upload) |
| POST | `/api/voice/tts` | Text-to-speech (returns MP3) |
| POST | `/api/voice/chat` | Voice-in, voice-out chat |
| GET | `/api/memory/` | Get conversation history |
| DELETE | `/api/memory/` | Clear conversation history |
| GET | `/api/tools/time` | Current time |
| GET | `/api/tools/weather?city=X` | Weather data |
| GET | `/api/tools/search?q=X` | Web search |

## Testing

```bash
# Backend tests
cd backend
python -m pytest tests -v

# Frontend tests
cd frontend
npm test
```

## Project Structure

```
jarvis-ai/
├── backend/
│   ├── main.py
│   ├── app/
│   │   ├── core/
│   │   │   ├── config.py
│   │   │   └── logging.py
│   │   ├── routers/
│   │   │   ├── chat.py
│   │   │   ├── voice.py
│   │   │   ├── memory.py
│   │   │   └── tools.py
│   │   ├── services/
│   │   │   ├── llm.py
│   │   │   ├── stt.py
│   │   │   └── tts.py
│   │   └── memory.py
│   ├── tests/
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── components/Avatar.tsx
│   │   ├── hooks/useChat.ts, useVoice.ts
│   │   ├── App.tsx
│   │   └── api.ts
│   └── Dockerfile
├── docker-compose.yml
├── requirements.txt
└── .env.example
```

## License

MIT

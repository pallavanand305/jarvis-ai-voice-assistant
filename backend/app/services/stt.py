import os
import tempfile
from ..core.config import settings

class STTService:
    def __init__(self):
        self.model_name = settings.WHISPER_MODEL
        self._model = None

    def _load(self):
        if self._model is None:
            try:
                from faster_whisper import WhisperModel
                self._model = WhisperModel(self.model_name, device="cpu", compute_type="int8")
            except Exception:
                self._model = None
        return self._model

    def transcribe(self, audio_bytes: bytes, suffix: str = ".wav") -> str:
        model = self._load()
        if model is None:
            raise RuntimeError("faster-whisper model unavailable")
        with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as f:
            f.write(audio_bytes)
            path = f.name
        try:
            segments, _ = model.transcribe(path, language=None)
            text = " ".join(s.text for s in segments).strip()
            return text
        finally:
            os.unlink(path)

stt = STTService()

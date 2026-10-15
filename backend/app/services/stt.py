import os
import tempfile
from ..core.config import settings


class STTService:
    def __init__(self):
        self.model_name = settings.WHISPER_MODEL
        self._model = None

    def _load(self):
        if self._model is None:
            from faster_whisper import WhisperModel

            self._model = WhisperModel(
                self.model_name,
                device="cpu",
                compute_type="int8",
                cpu_threads=4,
            )
        return self._model

    def transcribe(self, audio_bytes: bytes, suffix: str = ".webm") -> str:
        model = self._load()
        with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as f:
            f.write(audio_bytes)
            path = f.name
        try:
            segments, _ = model.transcribe(
                path,
                language=None,
                beam_size=5,
                best_of=5,
                vad_filter=True,
                vad_parameters={"min_silence_duration_ms": 500},
                condition_on_previous_text=False,
                initial_prompt="Yeh Hindi, Hinglish aur English mixed baat-cheet hai. Jarvis ek AI assistant hai.",
                temperature=0.0,
            )
            return " ".join(s.text for s in segments).strip()
        finally:
            try:
                os.unlink(path)
            except OSError:
                pass


stt = STTService()

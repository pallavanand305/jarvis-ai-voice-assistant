import os
import tempfile
import asyncio
import concurrent.futures
from ..core.config import settings

_executor = concurrent.futures.ThreadPoolExecutor(max_workers=2)


class TTSService:
    def __init__(self):
        self.engine = settings.TTS_ENGINE

    def synth(self, text: str, lang: str = "en") -> bytes:
        if self.engine == "edge-tts":
            return self._edge(text, lang)
        raise RuntimeError(f"TTS engine {self.engine} not available")

    def _edge(self, text: str, lang: str) -> bytes:
        import edge_tts

        voice = settings.TTS_VOICE_HI if lang.startswith("hi") else settings.TTS_VOICE

        async def run() -> bytes:
            communicate = edge_tts.Communicate(text, voice)
            with tempfile.NamedTemporaryFile(delete=False, suffix=".mp3") as f:
                path = f.name
            try:
                await communicate.save(path)
                with open(path, "rb") as rf:
                    return rf.read()
            finally:
                try:
                    os.unlink(path)
                except OSError:
                    pass

        def runner() -> bytes:
            return asyncio.run(run())

        try:
            asyncio.get_running_loop()
        except RuntimeError:
            return runner()

        with concurrent.futures.ThreadPoolExecutor(max_workers=1) as pool:
            return pool.submit(runner).result(timeout=60)


tts = TTSService()

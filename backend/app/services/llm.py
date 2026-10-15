import os
import json
from typing import List, Dict
from ..core.config import settings

class LLMService:
    def __init__(self):
        self.provider = settings.LLM_PROVIDER
        self.model = settings.LLM_MODEL
        self.api_key = settings.OPENAI_API_KEY

    def generate(self, history: List[Dict[str, str]]) -> str:
        if self.provider == "openai":
            if not self.api_key:
                return self._fallback(history)
            try:
                import httpx
                headers = {
                    "Authorization": f"Bearer {self.api_key}",
                    "Content-Type": "application/json",
                }
                payload = {
                    "model": self.model,
                    "messages": [
                        {"role": "system", "content": "You are Jarvis, a helpful AI assistant. Reply in the same language as the user (Hindi, Hinglish, or English)."},
                    ] + history,
                    "max_tokens": 512,
                }
                resp = httpx.post(
                    "https://api.openai.com/v1/chat/completions",
                    headers=headers,
                    json=payload,
                    timeout=30.0,
                )
                resp.raise_for_status()
                data = resp.json()
                return data["choices"][0]["message"]["content"].strip()
            except Exception as e:
                return self._fallback(history, error=str(e))
        return self._fallback(history)

    def _fallback(self, history: List[Dict[str, str]], error: str | None = None) -> str:
        last = history[-1]["content"] if history else ""
        msg = f"Jarvis fallback: I received '{last}'."
        if error:
            msg += f" (LLM error: {error})"
        return msg

llm = LLMService()

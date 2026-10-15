import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from app.services.llm import LLMService

def test_fallback_when_no_key():
    svc = LLMService()
    svc.api_key = None
    out = svc.generate([{"role": "user", "content": "hi"}])
    assert "fallback" in out.lower()

def test_history_building():
    svc = LLMService()
    svc.api_key = None
    hist = [{"role": "user", "content": "a"}, {"role": "assistant", "content": "b"}, {"role": "user", "content": "c"}]
    out = svc.generate(hist)
    assert isinstance(out, str) and len(out) > 0

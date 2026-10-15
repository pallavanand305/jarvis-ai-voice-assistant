import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_root():
    r = client.get("/")
    assert r.status_code == 200
    assert r.json()["status"] == "ok"

def test_chat():
    r = client.post("/api/chat/", json={"message": "hello", "language": "en"})
    assert r.status_code == 200
    data = r.json()
    assert "response" in data
    assert len(data["response"]) > 0

def test_chat_empty():
    r = client.post("/api/chat/", json={"message": "   "})
    assert r.status_code == 400

def test_time():
    r = client.get("/api/tools/time")
    assert r.status_code == 200
    assert "time" in r.json()

def test_weather_no_key():
    r = client.get("/api/tools/weather?city=Delhi")
    assert r.status_code == 400

def test_search_empty():
    r = client.get("/api/tools/search?q=")
    assert r.status_code == 400

def test_memory_flow():
    client.post("/api/chat/", json={"message": "remember this", "language": "en"})
    r = client.get("/api/memory/")
    assert r.status_code == 200
    history = r.json()["history"]
    assert len(history) >= 1
    r = client.delete("/api/memory/")
    assert r.status_code == 200
    r = client.get("/api/memory/")
    assert r.json()["history"] == []

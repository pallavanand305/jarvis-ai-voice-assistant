import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from app.services.brain import BrainService


def test_greeting_returns_hindi_capabilities():
    b = BrainService()
    b.api_key = None
    out = b.respond("hello jarvis", [])
    assert "Namaste" in out
    assert "Google search" in out


def test_what_can_you_do():
    b = BrainService()
    b.api_key = None
    out = b.respond("kya kar sakte ho", [])
    assert "Google search" in out and "Email search" in out


def test_time_tool():
    b = BrainService()
    b.api_key = None
    out = b.respond("abhi kitne baje hain", [])
    assert "baje" in out


def test_google_search_tool():
    b = BrainService()
    b.api_key = None
    out = b.respond("google pe python tutorial search karo", [])
    assert "google.com/search" in out


def test_email_search_tool():
    b = BrainService()
    b.api_key = None
    out = b.respond("mail dhundo project report ke baare mein", [])
    assert "mail.google.com" in out


def test_who_are_you():
    b = BrainService()
    b.api_key = None
    out = b.respond("tum kaun ho", [])
    assert "Jarvis" in out

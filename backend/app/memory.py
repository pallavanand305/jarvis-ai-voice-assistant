import os
import sqlite3
from datetime import datetime

DB_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), "jarvis.db")

def init_db():
    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()
    cur.execute("""
        CREATE TABLE IF NOT EXISTS conversations (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_message TEXT NOT NULL,
            assistant_message TEXT NOT NULL,
            language TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)
    conn.commit()
    conn.close()

def save_conversation(user_message: str, assistant_message: str, language: str = "auto"):
    init_db()
    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()
    cur.execute(
        "INSERT INTO conversations (user_message, assistant_message, language, created_at) VALUES (?, ?, ?, ?)",
        (user_message, assistant_message, language, datetime.now().isoformat()),
    )
    conn.commit()
    conn.close()

def get_history(limit: int = 20):
    init_db()
    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()
    cur.execute(
        "SELECT user_message, assistant_message, language, created_at FROM conversations ORDER BY id DESC LIMIT ?",
        (limit,),
    )
    rows = cur.fetchall()
    conn.close()
    return [
        {
            "user_message": r[0],
            "assistant_message": r[1],
            "language": r[2],
            "created_at": r[3],
        }
        for r in reversed(rows)
    ]

def clear_history():
    init_db()
    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()
    cur.execute("DELETE FROM conversations")
    conn.commit()
    conn.close()

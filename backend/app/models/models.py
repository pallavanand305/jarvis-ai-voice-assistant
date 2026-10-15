from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class Message(BaseModel):
    role: str
    content: str
    timestamp: datetime = datetime.now()

class Conversation(BaseModel):
    messages: List[Message] = []

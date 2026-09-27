"""
Pydantic models and schemas for Chat and Live Probe endpoints.
"""

from typing import List, Optional
from pydantic import BaseModel

class ChatMessage(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    message: str
    history: Optional[List[ChatMessage]] = []

class ProbeRequest(BaseModel):
    prompt: str

"""
Pydantic schemas for Retain, Recall, Reflect, and Diagnose endpoints.
"""

from typing import Optional
from pydantic import BaseModel

class RetainRequest(BaseModel):
    title: str
    details: str
    event_type: str = "MANUAL_EVENT"
    page: Optional[str] = "linear.app"
    date: Optional[str] = "2026-03-01"

class RecallRequest(BaseModel):
    query: str
    limit: Optional[int] = 5

class ReflectRequest(BaseModel):
    query: str = "What content factors determine whether Linear is cited over Jira in AI search?"

class DiagnoseRequest(BaseModel):
    query: str

"""
Main API Router aggregating all sub-routers under /api prefix.
"""

from fastapi import APIRouter
from app.api.endpoints import status, timeline, chat, memory

api_router = APIRouter(prefix="/api")

api_router.include_router(status.router, tags=["Status"])
api_router.include_router(timeline.router, tags=["Timeline"])
api_router.include_router(chat.router, tags=["Chat"])
api_router.include_router(memory.router, tags=["Memory"])

"""
Main API Router aggregating all sub-routers under /api prefix.
"""

from fastapi import APIRouter
from app.api.endpoints import status, timeline, chat, memory, auth, coder, jobs

api_router = APIRouter(prefix="/api")

api_router.include_router(status.router, tags=["Status"])
api_router.include_router(timeline.router, tags=["Timeline"])
api_router.include_router(chat.router, tags=["Chat"])
api_router.include_router(memory.router, tags=["Memory"])
api_router.include_router(auth.router, tags=["Authentication"])
api_router.include_router(coder.router, tags=["Coder Feature Memory"])
api_router.include_router(jobs.router, tags=["Jobs Automation"])


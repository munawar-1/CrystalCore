"""
Timeline and multi-week citation analytics endpoint.
"""

from typing import Dict, Any
from fastapi import APIRouter
from app.services.hindsight_service import hindsight_service

router = APIRouter()

@router.get("/timeline")
def get_timeline() -> Dict[str, Any]:
    """Returns the full 8-week timeline and citation metrics for the dashboard graph."""
    return hindsight_service.get_timeline_data()

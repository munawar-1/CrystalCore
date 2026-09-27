"""
System status and health check endpoint.
"""

from typing import Dict, Any
from fastapi import APIRouter
from app.services.hindsight_service import hindsight_service
from app.services.groq_service import groq_service

router = APIRouter()

@router.get("/status")
def get_status() -> Dict[str, Any]:
    """Returns system configuration and connectivity status."""
    return {
        "status": "healthy",
        "agent": "CrystalCore (GeoHindsight)",
        "target_brand": "Linear",
        "primary_rival": "Atlassian Jira",
        "memory_bank_id": hindsight_service.bank_id,
        "hindsight_cloud_connected": hindsight_service.client is not None,
        "groq_connected": groq_service.client is not None,
        "active_groq_model": groq_service.model
    }

"""
Timeline and multi-week citation analytics endpoint.
"""

from typing import Dict, Any, List
from fastapi import APIRouter
from app.services.hindsight_service import hindsight_service
from app.core.database import get_citation_snapshots

router = APIRouter()

@router.get("/timeline")
def get_timeline() -> Dict[str, Any]:
    """Returns the full 8-week timeline and citation metrics for the dashboard graph."""
    return hindsight_service.get_timeline_data()

@router.get("/citations/timeline")
def get_citations_timeline() -> Dict[str, Any]:
    """
    Returns historical AI search citation snapshots for Linear vs. Jira.
    If no weekly Perplexity probe snapshots exist yet, returns initial baseline timeline data.
    """
    snapshots = get_citation_snapshots(limit=52)
    
    if not snapshots:
        seed = hindsight_service.get_timeline_data()
        baseline: List[Dict[str, Any]] = []
        for evt in seed.get("timeline", []):
            m = evt.get("citation_metrics", {})
            perp_rate = float(m.get("perplexity_citation_rate", 50.0))
            jira_rate = round(100.0 - perp_rate, 1)
            baseline.append({
                "date": evt.get("date"),
                "linear_citation_rate": perp_rate,
                "jira_citation_rate": jira_rate,
                "total_queries": 20,
                "linear_citations": round(20 * (perp_rate / 100.0)),
                "jira_citations": round(20 * (jira_rate / 100.0)),
                "google_rank": m.get("google_rank"),
                "source": "baseline_audit"
            })
        return {"data": baseline, "source": "baseline_audit"}

    data = [
        {
            "date": s["date"],
            "linear_citation_rate": s["linear_citation_rate"],
            "jira_citation_rate": s["jira_citation_rate"],
            "total_queries": s["total_queries"],
            "linear_citations": s["linear_citations"],
            "jira_citations": s["jira_citations"],
            "google_rank": s.get("google_rank"),  # Explicitly nullable (None if not provided)
            "source": "live_sonar_probes"
        }
        for s in snapshots
    ]
    return {"data": data, "source": "live_sonar_probes"}


"""
API endpoints for manually triggering and monitoring background automation jobs.
Enables instant hackathon testing of Jira Scraper and Perplexity Citation Probe without waiting for cron intervals.
"""

from typing import Dict, Any, Optional, List
from fastapi import APIRouter, BackgroundTasks
from pydantic import BaseModel
from app.jobs.jira_monitor import run_jira_monitor
from app.jobs.citation_probe import run_citation_probe
from app.jobs.scheduler import scheduler

router = APIRouter(prefix="/jobs")

class JiraManualRunRequest(BaseModel):
    urls: Optional[List[str]] = None

class CitationProbeManualRunRequest(BaseModel):
    queries: Optional[List[str]] = None
    query_set_version: Optional[str] = "v1"

@router.post("/jira-monitor/run")
async def trigger_jira_monitor(req: Optional[JiraManualRunRequest] = None) -> Dict[str, Any]:
    """
    MANUAL RUN: Executes the Jira competitor scraper immediately.
    Checks target pages, diffs content hashes, summarizes changes via Groq, and retains memory.
    """
    urls = req.urls if req else None
    summary = await run_jira_monitor(force_urls=urls)
    scheduler.last_jira_run = summary.get("details", [{}])[0].get("url")
    scheduler.last_jira_summary = summary
    return {
        "status": "success",
        "job": "jira_monitor",
        "result": summary
    }

@router.post("/citation-probe/run")
async def trigger_citation_probe(req: Optional[CitationProbeManualRunRequest] = None) -> Dict[str, Any]:
    """
    MANUAL RUN: Executes the AI Citation Probe immediately.
    Queries Perplexity Sonar across the query set, computes Linear vs Jira citation rates,
    and appends a weekly snapshot to the database.
    """
    queries = req.queries if req else None
    version = req.query_set_version if req and req.query_set_version else "v1"
    summary = await run_citation_probe(custom_queries=queries, query_set_version=version)
    scheduler.last_probe_summary = summary
    return {
        "status": "success",
        "job": "citation_probe",
        "result": summary
    }

@router.get("/status")
def get_jobs_status() -> Dict[str, Any]:
    """Returns the current status of background jobs and scheduler."""
    return scheduler.get_status()

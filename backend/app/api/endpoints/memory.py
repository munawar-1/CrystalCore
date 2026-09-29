"""
Memory management endpoints: Retain, Recall, Reflect, and Diagnose.
"""

from typing import Dict, Any
from fastapi import APIRouter
from app.schemas.memory import RetainRequest, RecallRequest, ReflectRequest, DiagnoseRequest
from app.services.hindsight_service import hindsight_service
from app.services.groq_service import groq_service

router = APIRouter()

@router.post("/retain")
@router.post("/memory/retain")
async def retain_memory(req: RetainRequest) -> Dict[str, Any]:
    """RETAIN: Ingests a new page update, competitor move, or engineering PR into Hindsight."""
    target_page = req.source_url or req.page or "https://www.atlassian.com/software/jira/vs-linear"
    comp_line = f"Competitor: {req.competitor}\n" if req.competitor else ""
    content = (
        f"[Dynamic Event - {req.date}]\n"
        f"Type: {req.event_type}\n"
        f"Title: {req.title}\n"
        f"Page: {target_page}\n"
        f"{comp_line}"
        f"Details: {req.details}"
    )
    meta = {
        "title": req.title,
        "event_type": req.event_type,
        "date": req.date,
        "page": target_page,
    }
    if req.competitor:
        meta["competitor"] = req.competitor
    if req.source_url:
        meta["source_url"] = req.source_url

    result = await hindsight_service.retain_async(
        content=content,
        metadata=meta
    )
    return result

@router.post("/memory/recall")
async def recall_memory(req: RecallRequest) -> Dict[str, Any]:
    """RECALL: Retrieves historical timeline and rule memories relevant to the query."""
    return await hindsight_service.recall_async(query=req.query, limit=req.limit or 5)

@router.post("/memory/reflect")
async def reflect_memory(req: ReflectRequest) -> Dict[str, Any]:
    """REFLECT: Synthesizes high-order strategic insights across weeks of stored data."""
    return await hindsight_service.reflect_async(query=req.query)

@router.post("/agent/diagnose")
async def diagnose(req: DiagnoseRequest) -> Dict[str, Any]:
    """Runs Before vs. After comparison (generic stateless LLM vs Hindsight-augmented agent)."""
    without_memory = groq_service.diagnose_without_memory(req.query)
    recall_res = await hindsight_service.recall_async(req.query, limit=5)
    reflect_res = await hindsight_service.reflect_async(req.query)

    with_memory = groq_service.diagnose_with_hindsight(
        user_query=req.query,
        memories=recall_res.get("results", []),
        reflection=reflect_res.get("synthesis", "")
    )

    return {
        "query": req.query,
        "without_memory": without_memory,
        "with_memory": with_memory,
        "recalled_memories": recall_res.get("results", []),
        "synthesized_reflection": reflect_res.get("synthesis", "")
    }

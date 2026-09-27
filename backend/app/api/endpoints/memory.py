"""
Memory management endpoints: Retain, Recall, Reflect, and Diagnose.
"""

from typing import Dict, Any
from fastapi import APIRouter
from app.schemas.memory import RetainRequest, RecallRequest, ReflectRequest, DiagnoseRequest
from app.services.hindsight_service import hindsight_service
from app.services.groq_service import groq_service

router = APIRouter()

@router.post("/memory/retain")
async def retain_memory(req: RetainRequest) -> Dict[str, Any]:
    """RETAIN: Ingests a new page update, competitor move, or engineering PR into Hindsight."""
    content = (
        f"[Dynamic Event - {req.date}]\n"
        f"Type: {req.event_type}\n"
        f"Title: {req.title}\n"
        f"Page: {req.page}\n"
        f"Details: {req.details}"
    )
    result = await hindsight_service.retain_async(
        content=content,
        metadata={"title": req.title, "event_type": req.event_type, "date": req.date, "page": req.page}
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

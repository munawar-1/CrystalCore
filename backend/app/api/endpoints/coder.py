"""
Coder Feature Memory Management Endpoints.
Allows developers/coders to update the Hindsight long-term memory bank
with what features, PRs, and architectural optimizations are added.
"""

import time
import uuid
from typing import Dict, Any, List
from fastapi import APIRouter, HTTPException
from app.schemas.coder import CoderFeatureIngestRequest, CoderFeatureRecord
from app.services.hindsight_service import hindsight_service

router = APIRouter(prefix="/coder")

# In-memory store of features updated into Hindsight by the Coder team
_CODER_FEATURE_LOGS: List[Dict[str, Any]] = [
    {
        "id": "feat-001",
        "title": "Shipped 'Linear Asks' AI Issue Triaging",
        "pr_number": "PR #942",
        "commit_hash": "c7a81df",
        "category": "CODE_RELEASE",
        "page": "linear.app/features/ai-asks",
        "details": "Merged sub-100ms automated issue triaging and semantic summarization into Linear core at zero extra fee.",
        "geo_impact_hypothesis": "Forces Perplexity & ChatGPT Search to cite Linear over Jira Service Management for AI workplace ticketing.",
        "coder_name": "Alex Chen (Lead Staff Engineer)",
        "date": "2026-01-19",
        "status": "RETAINED_IN_HINDSIGHT",
        "hindsight_memory_id": "mem-hnd-942",
        "timestamp": "2026-01-19T10:30:00Z"
    },
    {
        "id": "feat-002",
        "title": "Local-First SQLite Multi-player Sync Engine",
        "pr_number": "PR #988",
        "commit_hash": "9e24b0c",
        "category": "PERF_OPTIMIZATION",
        "page": "linear.app/blog/sync-engine-architecture",
        "details": "Architected zero-latency optimistic state sync with WebSockets and embedded client SQLite, achieving 50ms interactions.",
        "geo_impact_hypothesis": "Establishes Linear as the primary citation target for 'fastest issue tracker' queries on Perplexity.",
        "coder_name": "Alex Chen (Lead Staff Engineer)",
        "date": "2026-01-15",
        "status": "RETAINED_IN_HINDSIGHT",
        "hindsight_memory_id": "mem-hnd-988",
        "timestamp": "2026-01-15T16:15:00Z"
    },
    {
        "id": "feat-003",
        "title": "High-Density Markdown Comparison Table Renderer",
        "pr_number": "PR #1015",
        "commit_hash": "4a7f21b",
        "category": "SCHEMA_UPDATE",
        "page": "linear.app/switch-from-jira",
        "details": "Engineered explicit semantic markdown headers and tables for side-by-side feature comparisons (Keyboard shortcuts, SLA, Cycles).",
        "geo_impact_hypothesis": "Per Hindsight rule, LLM search engines index structured markdown tables 3.8x more frequently than narrative text.",
        "coder_name": "Alex Chen (Lead Staff Engineer)",
        "date": "2026-02-02",
        "status": "RETAINED_IN_HINDSIGHT",
        "hindsight_memory_id": "mem-hnd-1015",
        "timestamp": "2026-02-02T11:45:00Z"
    }
]

@router.get("/features")
async def list_coder_features() -> Dict[str, Any]:
    """Returns the history of all features retained into Hindsight memory by coders."""
    return {
        "bank_id": hindsight_service.bank_id,
        "total_features_retained": len(_CODER_FEATURE_LOGS),
        "features": _CODER_FEATURE_LOGS
    }

@router.post("/features", response_model=Dict[str, Any])
async def ingest_feature_into_memory(req: CoderFeatureIngestRequest) -> Dict[str, Any]:
    """
    CODER ACTION: Ingests and commits a newly added feature / PR into Hindsight long-term memory.
    Updates the memory bank 'linear-seo-intelligence' with technical details so the AI agent
    and marketing team can immediately recall and reflect on it.
    """
    feature_id = f"feat-{uuid.uuid4().hex[:6]}"
    pr_tag = f" [{req.pr_number}]" if req.pr_number else ""
    commit_tag = f" (commit {req.commit_hash})" if req.commit_hash else ""

    # Synthesize comprehensive structured memory content for Hindsight
    memory_content = (
        f"[Coder Feature Deployment - {req.date}]\n"
        f"Feature: {req.title}{pr_tag}{commit_tag}\n"
        f"Author: {req.coder_name}\n"
        f"Category: {req.category}\n"
        f"Target Page: {req.page}\n"
        f"Technical Details: {req.details}\n"
        f"GEO Impact Hypothesis: {req.geo_impact_hypothesis or 'Strengthens Linear technical authority in AI search engines.'}"
    )

    metadata = {
        "source": "coder_portal",
        "author": req.coder_name,
        "role": "coder",
        "title": req.title,
        "pr": req.pr_number or "N/A",
        "commit": req.commit_hash or "N/A",
        "event_type": req.category,
        "page": req.page,
        "date": req.date
    }

    # Ingest into Vectorize Hindsight memory bank
    retain_result = await hindsight_service.retain_async(content=memory_content, metadata=metadata)

    new_record = {
        "id": feature_id,
        "title": req.title,
        "pr_number": req.pr_number,
        "commit_hash": req.commit_hash,
        "category": req.category,
        "page": req.page,
        "details": req.details,
        "geo_impact_hypothesis": req.geo_impact_hypothesis,
        "coder_name": req.coder_name,
        "date": req.date,
        "status": "RETAINED_IN_HINDSIGHT",
        "hindsight_memory_id": f"mem-hnd-{feature_id}",
        "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
    }

    _CODER_FEATURE_LOGS.insert(0, new_record)

    return {
        "success": True,
        "message": f"Successfully updated Hindsight memory with feature: '{req.title}'",
        "bank_id": hindsight_service.bank_id,
        "feature": new_record,
        "hindsight_result": retain_result
    }

@router.get("/stats")
async def get_coder_stats() -> Dict[str, Any]:
    """Returns memory status and coder metrics."""
    return {
        "bank_id": hindsight_service.bank_id,
        "total_features": len(_CODER_FEATURE_LOGS),
        "categories": {
            "CODE_RELEASE": sum(1 for f in _CODER_FEATURE_LOGS if f.get("category") == "CODE_RELEASE"),
            "PERF_OPTIMIZATION": sum(1 for f in _CODER_FEATURE_LOGS if f.get("category") == "PERF_OPTIMIZATION"),
            "SCHEMA_UPDATE": sum(1 for f in _CODER_FEATURE_LOGS if f.get("category") == "SCHEMA_UPDATE"),
            "BENCHMARK_RELEASE": sum(1 for f in _CODER_FEATURE_LOGS if f.get("category") == "BENCHMARK_RELEASE")
        },
        "latest_update": _CODER_FEATURE_LOGS[0] if _CODER_FEATURE_LOGS else None
    }

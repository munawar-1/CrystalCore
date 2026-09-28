"""
Pydantic schemas for Coder Feature Memory Ingestion.
Allows coders to update Hindsight long-term memory with what features/PRs are added.
"""

from typing import Optional, List, Dict, Any
from pydantic import BaseModel

class CoderFeatureIngestRequest(BaseModel):
    title: str
    pr_number: Optional[str] = None
    commit_hash: Optional[str] = None
    category: str = "CODE_RELEASE"  # "CODE_RELEASE", "BENCHMARK_RELEASE", "SCHEMA_UPDATE", "PERF_OPTIMIZATION", "BUG_FIX"
    page: Optional[str] = "linear.app/features"
    details: str
    geo_impact_hypothesis: Optional[str] = None
    coder_name: Optional[str] = "Alex Chen"
    date: Optional[str] = "2026-03-01"

class CoderFeatureRecord(BaseModel):
    id: str
    title: str
    pr_number: Optional[str]
    commit_hash: Optional[str]
    category: str
    page: str
    details: str
    geo_impact_hypothesis: Optional[str]
    coder_name: str
    date: str
    status: str
    hindsight_memory_id: Optional[str] = None
    timestamp: str

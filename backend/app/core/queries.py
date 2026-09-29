"""
Configurable Query Set for AI Citation Probes.
Can be extended or overridden via citation_queries.json in the data directory.
"""

import os
import json
from typing import List
from app.core.config import settings

DEFAULT_CITATION_QUERIES: List[str] = [
    "Linear vs Jira for startups",
    "Best issue tracker for startups",
    "Jira alternatives for small teams",
    "Linear alternatives",
    "Best project management tools for software teams",
    "Best fast issue tracker",
    "Jira vs Linear performance",
    "Jira vs Linear developer experience",
    "Jira vs Linear for engineering teams",
    "Best agile project management software",
    "Best issue tracking software",
    "Best Jira alternatives",
    "Best Linear alternatives",
    "Project management tools for developers",
    "Best software development project management tools",
    "Issue tracker for small engineering teams",
    "Issue tracker for startups",
    "Best engineering team productivity tools",
    "Linear vs Jira workflow",
    "Linear vs Jira pricing",
]

def get_citation_queries() -> List[str]:
    """
    Returns the list of probe queries.
    Checks data/citation_queries.json first; falls back to DEFAULT_CITATION_QUERIES.
    """
    json_path = os.path.join(settings.DATA_DIR, "citation_queries.json")
    if os.path.exists(json_path):
        try:
            with open(json_path, "r", encoding="utf-8") as f:
                loaded = json.load(f)
                if isinstance(loaded, list) and len(loaded) > 0:
                    return [str(q).strip() for q in loaded if str(q).strip()]
        except Exception as e:
            print(f"[Queries] Error loading {json_path}: {e}. Using defaults.")
            
    return DEFAULT_CITATION_QUERIES

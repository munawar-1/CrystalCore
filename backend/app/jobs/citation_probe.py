"""
Automated AI Citation Probing Job.
Executes real AI search queries against Perplexity Sonar on a weekly schedule.
Measures and records AI search citation rates for Linear (linear.app) vs. Jira (atlassian.com).
Stores results into SQLite citation_snapshots and exposes them to the dashboard timeline.
"""

import os
import uuid
import logging
import datetime
import urllib.parse
from typing import Dict, Any, List, Optional

import httpx
from app.core.config import settings
from app.core.queries import get_citation_queries
from app.core.database import insert_citation_snapshot

logger = logging.getLogger("citation_probe")
if not logger.handlers:
    logging.basicConfig(level=logging.INFO)

def normalize_domain(url_or_domain: str) -> str:
    """
    Normalizes a citation URL or domain string to a canonical base domain.
    E.g.
    https://www.atlassian.com/software/jira -> atlassian.com
    https://linear.app/features -> linear.app
    """
    if not url_or_domain:
        return ""
    text = url_or_domain.strip().lower()
    if "://" not in text and not text.startswith("//"):
        text = "https://" + text
    try:
        parsed = urllib.parse.urlparse(text)
        host = (parsed.hostname or "").lower()
        if host.startswith("www."):
            host = host[4:]
        if host.endswith("linear.app") or host == "linear.app":
            return "linear.app"
        if host.endswith("atlassian.com") or host == "atlassian.com" or host.endswith("jira.com") or host == "jira.com":
            return "atlassian.com"
        return host
    except Exception:
        return ""

def calculate_citation_rates(successful_queries: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Calculates weekly citation metrics across completed queries.
    Returns counts and rates.
    """
    total = len(successful_queries)
    if total == 0:
        return {
            "total_queries": 0,
            "linear_citations": 0,
            "jira_citations": 0,
            "linear_citation_rate": 0.0,
            "jira_citation_rate": 0.0
        }

    linear_count = sum(1 for q in successful_queries if q.get("linear_citation") == 1)
    jira_count = sum(1 for q in successful_queries if q.get("jira_citation") == 1)

    linear_rate = round((linear_count / total) * 100.0, 1)
    jira_rate = round((jira_count / total) * 100.0, 1)

    return {
        "total_queries": total,
        "linear_citations": linear_count,
        "jira_citations": jira_count,
        "linear_citation_rate": linear_rate,
        "jira_citation_rate": jira_rate
    }

async def query_perplexity_sonar(
    query: str,
    api_key: str,
    model: str = "sonar"
) -> Dict[str, Any]:
    """
    Sends a search query to the official Perplexity API.
    Captures answer text and citation URLs.
    """
    endpoint = "https://api.perplexity.ai/chat/completions"
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }
    payload = {
        "model": model,
        "messages": [
            {
                "role": "system",
                "content": "You are a precise, objective technology evaluator. Provide clear factual comparisons with sources."
            },
            {
                "role": "user",
                "content": query
            }
        ]
    }

    async with httpx.AsyncClient(timeout=30.0) as client:
        resp = await client.post(endpoint, json=payload, headers=headers)
        if resp.status_code != 200:
            raise RuntimeError(f"Perplexity API error {resp.status_code}: {resp.text}")
        data = resp.json()

    choices = data.get("choices", [])
    answer = choices[0]["message"]["content"] if choices else ""
    raw_citations = data.get("citations", [])

    return {
        "query": query,
        "answer": answer,
        "citations": raw_citations,
        "model": model,
        "timestamp": datetime.datetime.now(datetime.timezone.utc).isoformat()
    }

async def run_citation_probe(
    custom_queries: Optional[List[str]] = None,
    query_set_version: str = "v1"
) -> Dict[str, Any]:
    """
    Main job executor for weekly AI Citation Probing.
    Runs Perplexity Sonar search for each query in query set, measures citations,
    and appends a weekly snapshot to the database.
    """
    print("[CITATION PROBE] Starting weekly citation probe job")
    api_key = settings.PERPLEXITY_API_KEY
    model = settings.PERPLEXITY_MODEL or "sonar"

    queries = custom_queries if custom_queries is not None else get_citation_queries()
    total_queries = len(queries)

    if not api_key:
        err = "PERPLEXITY_API_KEY is not configured in environment variables. Citation probe requires Perplexity API."
        print(f"[CITATION PROBE] {err}")
        return {
            "queries_total": total_queries,
            "queries_successful": 0,
            "queries_failed": total_queries,
            "linear_citations": 0,
            "jira_citations": 0,
            "linear_citation_rate": 0.0,
            "jira_citation_rate": 0.0,
            "error": err
        }

    successful_queries: List[Dict[str, Any]] = []
    failed_queries: List[Dict[str, Any]] = []

    for idx, query in enumerate(queries, 1):
        print(f"[CITATION PROBE] ({idx}/{total_queries}) Probing query: '{query}'")
        try:
            probe_res = await query_perplexity_sonar(query, api_key=api_key, model=model)
            raw_citations = probe_res.get("citations", [])
            
            # Normalize domains
            normalized_domains = [normalize_domain(c) for c in raw_citations if c]
            
            linear_cited = 1 if "linear.app" in normalized_domains else 0
            jira_cited = 1 if "atlassian.com" in normalized_domains else 0

            record = {
                "query": query,
                "answer": probe_res.get("answer"),
                "citations": raw_citations,
                "normalized_domains": normalized_domains,
                "linear_citation": linear_cited,
                "jira_citation": jira_cited,
                "total_citations": len(raw_citations),
                "timestamp": probe_res.get("timestamp"),
                "model": model
            }
            successful_queries.append(record)
        except Exception as e:
            print(f"[CITATION PROBE] Query '{query}' failed: {e}")
            failed_queries.append({"query": query, "error": str(e)})

    # Calculate metrics
    metrics = calculate_citation_rates(successful_queries)
    today_date = datetime.date.today().isoformat()

    snapshot_record = None
    if successful_queries:
        snapshot_id = f"snap-{uuid.uuid4().hex[:8]}"
        # Store weekly snapshot in SQLite database (google_rank explicitly null as instructed)
        snapshot_record = insert_citation_snapshot(
            snapshot_id=snapshot_id,
            date=today_date,
            query_set_version=query_set_version,
            linear_citation_rate=metrics["linear_citation_rate"],
            jira_citation_rate=metrics["jira_citation_rate"],
            total_queries=metrics["total_queries"],
            linear_citations=metrics["linear_citations"],
            jira_citations=metrics["jira_citations"],
            google_rank=None,  # Not fabricated
            raw_results=successful_queries
        )
        print(f"[CITATION PROBE] Stored weekly citation snapshot for {today_date}: Linear={metrics['linear_citation_rate']}%, Jira={metrics['jira_citation_rate']}%")

    output_summary = {
        "queries_total": total_queries,
        "queries_successful": len(successful_queries),
        "queries_failed": len(failed_queries),
        "linear_citations": metrics["linear_citations"],
        "jira_citations": metrics["jira_citations"],
        "linear_citation_rate": metrics["linear_citation_rate"],
        "jira_citation_rate": metrics["jira_citation_rate"],
        "snapshot": snapshot_record
    }
    
    print(f"[CITATION PROBE] Completed: {output_summary}")
    return output_summary

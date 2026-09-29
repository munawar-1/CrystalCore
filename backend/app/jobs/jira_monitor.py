"""
Automated Jira Competitor Scraper Job.
Monitors Atlassian / Jira competitor landing pages, detects content changes via SHA-256 hashes,
summarizes changes using Groq/Llama, and commits dynamic events into Hindsight memory.
"""

import os
import re
import html
import uuid
import hashlib
import logging
import datetime
import urllib.parse
from typing import Dict, Any, List, Optional
import xml.etree.ElementTree as ET

import httpx
from app.core.config import settings
from app.core.database import (
    get_competitor_page,
    upsert_competitor_page,
    update_competitor_page_checked,
)
from app.schemas.memory import RetainRequest
from app.api.endpoints.memory import retain_memory

logger = logging.getLogger("jira_monitor")
if not logger.handlers:
    logging.basicConfig(level=logging.INFO)

# SSRF Protection: Allowed domains for competitor scraping
ALLOWED_COMPETITOR_DOMAINS = ["atlassian.com", "jira.com"]

def is_safe_url(url: str) -> bool:
    """Validates URL to protect against SSRF vulnerabilities."""
    try:
        parsed = urllib.parse.urlparse(url)
        if parsed.scheme not in ("http", "https"):
            return False
        hostname = (parsed.hostname or "").lower()
        if not hostname:
            return False
        # Block localhost / private IP ranges
        if hostname in ("localhost", "127.0.0.1", "0.0.0.0", "::1", "169.254.169.254"):
            return False
        if hostname.startswith("10.") or hostname.startswith("192.168.") or hostname.startswith("172."):
            return False
        # Must end with allowed domain
        return any(hostname == d or hostname.endswith("." + d) for d in ALLOWED_COMPETITOR_DOMAINS)
    except Exception:
        return False

def clean_and_normalize_content(raw_html: str) -> str:
    """
    Strips scripts, styles, navigation, footer, SVG, and HTML tags.
    Normalizes whitespace and removes noise for robust SHA-256 hashing.
    """
    if not raw_html:
        return ""

    # Remove script, style, noscript, nav, header, footer, svg, iframe
    cleaned = re.sub(r'<(script|style|noscript|nav|header|footer|svg|iframe)\b[^>]*>.*?</\1>', '', raw_html, flags=re.DOTALL | re.IGNORECASE)
    # Remove HTML comments
    cleaned = re.sub(r'<!--.*?-->', '', cleaned, flags=re.DOTALL)
    # Remove all remaining HTML tags
    cleaned = re.sub(r'<[^>]+>', ' ', cleaned)
    # Decode HTML entities
    cleaned = html.unescape(cleaned)
    # Remove common ephemeral timestamps / copyright years (e.g. © 2026 Atlassian)
    cleaned = re.sub(r'©\s*\d{4}', '', cleaned)
    # Collapse multiple whitespaces into a single space
    cleaned = re.sub(r'\s+', ' ', cleaned).strip()
    return cleaned

def generate_content_hash(normalized_text: str) -> str:
    """Generates SHA-256 hash of normalized content."""
    return hashlib.sha256(normalized_text.encode("utf-8")).hexdigest()

def fetch_sitemap_urls(sitemap_url: str) -> List[str]:
    """
    Safely fetches and parses the Atlassian product sitemap XML.
    Returns any matching Jira / comparison URLs.
    """
    print("[JIRA MONITOR] Checking sitemap")
    if not is_safe_url(sitemap_url):
        print(f"[JIRA MONITOR] Sitemap URL failed safety validation: {sitemap_url}")
        return []

    try:
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36 GeoHindsight/1.0"
        }
        with httpx.Client(timeout=15.0, follow_redirects=True) as client:
            resp = client.get(sitemap_url, headers=headers)
            if resp.status_code != 200:
                print(f"[JIRA MONITOR] Sitemap fetch returned HTTP {resp.status_code}")
                return []

            # Parse XML safely
            root = ET.fromstring(resp.content)
            urls = []
            # Extract <loc> tags regardless of XML namespace
            for elem in root.iter():
                if elem.tag.endswith("loc") and elem.text:
                    url_text = elem.text.strip()
                    if "jira" in url_text.lower():
                        urls.append(url_text)
            return urls
    except Exception as e:
        print(f"[JIRA MONITOR] Sitemap parsing failed: {e}")
        return []

def summarize_page_change_with_groq(previous_content: str, new_content: str) -> Optional[str]:
    """
    Generates a concise 1-sentence summary of the page change using Groq/Llama.
    """
    from groq import Groq
    api_key = settings.GROQ_API_KEY
    if not api_key:
        print("[JIRA MONITOR] Warning: GROQ_API_KEY not set. Cannot generate AI summary.")
        return None

    model = settings.GROQ_MODEL or "llama-3.3-70b-versatile"
    
    # Take representative text chunks to keep within token limits while preserving diff context
    prev_snippet = previous_content[:4000]
    new_snippet = new_content[:4000]

    system_prompt = (
        "You are monitoring a competitor website.\n"
        "Compare the previous page content with the new page content.\n"
        "Identify the most meaningful change.\n"
        "Return exactly ONE concise sentence describing what changed.\n"
        "Do not speculate.\n"
        "If the difference appears to be navigation, tracking, timestamps, or insignificant formatting, "
        "say that it is a minor content/formatting change."
    )

    user_prompt = (
        f"PREVIOUS CONTENT:\n{prev_snippet}\n\n"
        f"NEW CONTENT:\n{new_snippet}\n\n"
        "Provide exactly ONE concise sentence describing what changed:"
    )

    try:
        client = Groq(api_key=api_key)
        completion = client.chat.completions.create(
            model=model,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            temperature=0.2,
            max_tokens=150,
        )
        summary = completion.choices[0].message.content.strip()
        # Clean any accidental line breaks or quotes
        summary = " ".join(summary.splitlines()).strip(' "')
        return summary
    except Exception as e:
        print(f"[JIRA MONITOR] Groq summary generation failed: {e}")
        return None

async def process_monitored_url(target_url: str) -> Dict[str, Any]:
    """
    Processes a single monitored competitor URL:
    - Fetches and normalizes page content
    - Generates content hash
    - Detects changes against SQLite database
    - Generates summary and retains memory if changed
    """
    print(f"[JIRA MONITOR] Checking {target_url}")
    result = {
        "url": target_url,
        "status": "pending",
        "change_detected": False,
        "summary_generated": False,
        "event_retained": False,
        "error": None
    }

    if not is_safe_url(target_url):
        err = f"URL {target_url} failed safety check"
        print(f"[JIRA MONITOR] {err}")
        result["error"] = err
        result["status"] = "error"
        return result

    # 1. Fetch Page Content
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36 GeoHindsight/1.0"
    }
    raw_html = ""
    try:
        async with httpx.AsyncClient(timeout=15.0, follow_redirects=True) as client:
            resp = await client.get(target_url, headers=headers)
            if resp.status_code != 200:
                print(f"[JIRA MONITOR] HTTP {resp.status_code} for {target_url} - skipping content update")
                result["status"] = f"http_{resp.status_code}"
                return result
            raw_html = resp.text
    except Exception as e:
        print(f"[JIRA MONITOR] Failed to fetch {target_url}: {e}")
        result["error"] = str(e)
        result["status"] = "fetch_failed"
        return result

    # 2. Normalize and Hash
    normalized_content = clean_and_normalize_content(raw_html)
    new_hash = generate_content_hash(normalized_content)
    now = datetime.datetime.now(datetime.timezone.utc).isoformat()

    # 3. Retrieve Previous Hash from Database
    existing_record = get_competitor_page(target_url)

    # 4. First Run Behavior
    if not existing_record or not existing_record.get("content_hash"):
        page_id = f"comp-{uuid.uuid4().hex[:8]}"
        upsert_competitor_page(
            page_id=page_id,
            url=target_url,
            competitor="Jira",
            content_hash=new_hash,
            last_checked_at=now,
            last_changed_at=now,
            last_content=normalized_content
        )
        print(f"[JIRA MONITOR] Initial snapshot stored for {target_url}")
        result["status"] = "initial_snapshot_stored"
        return result

    previous_hash = existing_record["content_hash"]
    previous_content = existing_record.get("last_content") or ""

    # 5. Subsequent Runs: Unchanged
    if new_hash == previous_hash:
        update_competitor_page_checked(target_url, now)
        print("[JIRA MONITOR] No change detected")
        result["status"] = "no_change"
        return result

    # 6. Subsequent Runs: Content Changed
    print("[JIRA MONITOR] Change detected")
    result["change_detected"] = True

    # 7. Generate Summary with Groq
    print("[JIRA MONITOR] Generating summary")
    summary = summarize_page_change_with_groq(previous_content, normalized_content)
    
    if not summary:
        print("[JIRA MONITOR] Error: Summary generation failed. Preserving retry state.")
        result["error"] = "groq_summary_failed"
        result["status"] = "summary_failed_retryable"
        # We do NOT update content_hash so next run will retry
        return result

    result["summary_generated"] = True
    result["summary"] = summary

    # 8. Retain Event into Hindsight via existing /api/retain endpoint
    print("[JIRA MONITOR] Retaining competitor event")
    today_date = datetime.date.today().isoformat()
    retain_req = RetainRequest(
        title="Atlassian Jira Competitor Page Update",
        details=summary,
        event_type="competitor_update",
        page=target_url,
        date=today_date,
        competitor="Jira",
        source_url=target_url
    )

    try:
        retain_res = await retain_memory(retain_req)
        result["event_retained"] = True
        result["retain_response"] = retain_res
        
        # 9. Store New Hash after successful processing
        upsert_competitor_page(
            page_id=existing_record["id"],
            url=target_url,
            competitor="Jira",
            content_hash=new_hash,
            last_checked_at=now,
            last_changed_at=now,
            last_content=normalized_content
        )
        result["status"] = "change_retained"
    except Exception as e:
        print(f"[JIRA MONITOR] Failed to retain memory: {e}")
        result["error"] = str(e)
        result["status"] = "retain_failed"

    return result

async def run_jira_monitor(force_urls: Optional[List[str]] = None) -> Dict[str, Any]:
    """
    Main job executor for Jira competitor monitoring.
    Can be scheduled or manually triggered.
    """
    monitored_urls = list(force_urls) if force_urls else list(settings.MONITORED_JIRA_URLS)
    
    # Always ensure primary target page is included
    primary_target = "https://www.atlassian.com/software/jira/vs-linear"
    if primary_target not in monitored_urls:
        monitored_urls.insert(0, primary_target)

    # Optionally discover URLs from sitemap
    sitemap_urls = fetch_sitemap_urls(settings.ATLASSIAN_SITEMAP_URL)
    for u in sitemap_urls:
        if "vs-linear" in u and u not in monitored_urls:
            monitored_urls.append(u)

    pages_checked = 0
    changes_detected = 0
    summaries_generated = 0
    events_retained = 0
    errors = 0
    details = []

    for url in monitored_urls:
        pages_checked += 1
        res = await process_monitored_url(url)
        details.append(res)
        if res.get("change_detected"):
            changes_detected += 1
        if res.get("summary_generated"):
            summaries_generated += 1
        if res.get("event_retained"):
            events_retained += 1
        if res.get("error"):
            errors += 1

    print("[JIRA MONITOR] Completed")

    summary_output = {
        "pages_checked": pages_checked,
        "changes_detected": changes_detected,
        "summaries_generated": summaries_generated,
        "events_retained": events_retained,
        "errors": errors,
        "details": details
    }
    return summary_output

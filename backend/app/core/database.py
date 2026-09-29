"""
Database management module for CrystalCore / GeoHindsight.
Uses SQLite for persistent storage of competitor page snapshots and weekly citation probe metrics.
"""

import os
import json
import sqlite3
import datetime
from typing import Dict, Any, List, Optional
from app.core.config import settings

def get_db_connection() -> sqlite3.Connection:
    """Creates and returns a SQLite connection with dict-like row access."""
    db_dir = os.path.dirname(settings.DB_PATH)
    if db_dir and not os.path.exists(db_dir):
        os.makedirs(db_dir, exist_ok=True)
        
    conn = sqlite3.connect(settings.DB_PATH, timeout=20.0)
    conn.row_factory = sqlite3.Row
    return conn

def init_db() -> None:
    """Initializes tables for competitor monitoring and citation probe snapshots."""
    with get_db_connection() as conn:
        cursor = conn.cursor()
        
        # 1. Competitor Pages Table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS competitor_pages (
                id TEXT PRIMARY KEY,
                url TEXT UNIQUE NOT NULL,
                competitor TEXT NOT NULL DEFAULT 'Jira',
                content_hash TEXT NOT NULL,
                last_checked_at TEXT NOT NULL,
                last_changed_at TEXT,
                last_content TEXT,
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL
            )
        """)
        
        # 2. Citation Snapshots Table (Weekly Perplexity Sonar Probes)
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS citation_snapshots (
                id TEXT PRIMARY KEY,
                date TEXT NOT NULL,
                query_set_version TEXT NOT NULL DEFAULT 'v1',
                linear_citation_rate REAL NOT NULL,
                jira_citation_rate REAL NOT NULL,
                total_queries INTEGER NOT NULL,
                linear_citations INTEGER NOT NULL,
                jira_citations INTEGER NOT NULL,
                google_rank INTEGER,
                raw_results TEXT,
                created_at TEXT NOT NULL,
                UNIQUE(date, query_set_version)
            )
        """)
        
        conn.commit()

# --- Competitor Page Store Helpers ---

def get_competitor_page(url: str) -> Optional[Dict[str, Any]]:
    """Retrieves an existing competitor page record by URL."""
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM competitor_pages WHERE url = ?", (url,))
        row = cursor.fetchone()
        if row:
            return dict(row)
        return None

def upsert_competitor_page(
    page_id: str,
    url: str,
    competitor: str,
    content_hash: str,
    last_checked_at: str,
    last_changed_at: Optional[str] = None,
    last_content: Optional[str] = None
) -> Dict[str, Any]:
    """Inserts or updates a competitor page record."""
    now = datetime.datetime.now(datetime.timezone.utc).isoformat()
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT id, created_at, last_changed_at FROM competitor_pages WHERE url = ?", (url,))
        existing = cursor.fetchone()
        
        if existing:
            changed_at = last_changed_at or existing["last_changed_at"] or now
            cursor.execute("""
                UPDATE competitor_pages
                SET competitor = ?,
                    content_hash = ?,
                    last_checked_at = ?,
                    last_changed_at = ?,
                    last_content = ?,
                    updated_at = ?
                WHERE url = ?
            """, (competitor, content_hash, last_checked_at, changed_at, last_content, now, url))
            record_id = existing["id"]
            created_at = existing["created_at"]
        else:
            changed_at = last_changed_at or now
            cursor.execute("""
                INSERT INTO competitor_pages (
                    id, url, competitor, content_hash, last_checked_at, last_changed_at, last_content, created_at, updated_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (page_id, url, competitor, content_hash, last_checked_at, changed_at, last_content, now, now))
            record_id = page_id
            created_at = now
            
        conn.commit()
        return {
            "id": record_id,
            "url": url,
            "competitor": competitor,
            "content_hash": content_hash,
            "last_checked_at": last_checked_at,
            "last_changed_at": changed_at,
            "created_at": created_at,
            "updated_at": now
        }

def update_competitor_page_checked(url: str, last_checked_at: str) -> None:
    """Updates only the last_checked_at timestamp when no content change is detected."""
    now = datetime.datetime.now(datetime.timezone.utc).isoformat()
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            UPDATE competitor_pages
            SET last_checked_at = ?, updated_at = ?
            WHERE url = ?
        """, (last_checked_at, now, url))
        conn.commit()

# --- Citation Snapshots Store Helpers ---

def get_citation_snapshots(limit: int = 52) -> List[Dict[str, Any]]:
    """Retrieves chronological citation snapshots."""
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            SELECT id, date, query_set_version, linear_citation_rate, jira_citation_rate,
                   total_queries, linear_citations, jira_citations, google_rank, created_at
            FROM citation_snapshots
            ORDER BY date ASC
            LIMIT ?
        """, (limit,))
        rows = cursor.fetchall()
        return [dict(r) for r in rows]

def insert_citation_snapshot(
    snapshot_id: str,
    date: str,
    query_set_version: str,
    linear_citation_rate: float,
    jira_citation_rate: float,
    total_queries: int,
    linear_citations: int,
    jira_citations: int,
    google_rank: Optional[int] = None,
    raw_results: Optional[List[Dict[str, Any]]] = None
) -> Optional[Dict[str, Any]]:
    """
    Inserts a weekly citation probe snapshot.
    Enforces idempotency: ignores or updates if (date, query_set_version) already exists.
    """
    now = datetime.datetime.now(datetime.timezone.utc).isoformat()
    raw_json = json.dumps(raw_results or [])
    
    with get_db_connection() as conn:
        cursor = conn.cursor()
        try:
            cursor.execute("""
                INSERT INTO citation_snapshots (
                    id, date, query_set_version, linear_citation_rate, jira_citation_rate,
                    total_queries, linear_citations, jira_citations, google_rank, raw_results, created_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                snapshot_id, date, query_set_version, linear_citation_rate, jira_citation_rate,
                total_queries, linear_citations, jira_citations, google_rank, raw_json, now
            ))
            conn.commit()
            return {
                "id": snapshot_id,
                "date": date,
                "query_set_version": query_set_version,
                "linear_citation_rate": linear_citation_rate,
                "jira_citation_rate": jira_citation_rate,
                "total_queries": total_queries,
                "linear_citations": linear_citations,
                "jira_citations": jira_citations,
                "google_rank": google_rank,
                "created_at": now
            }
        except sqlite3.IntegrityError:
            # Duplicate snapshot for this (date, query_set_version) - update existing
            cursor.execute("""
                UPDATE citation_snapshots
                SET linear_citation_rate = ?,
                    jira_citation_rate = ?,
                    total_queries = ?,
                    linear_citations = ?,
                    jira_citations = ?,
                    google_rank = ?,
                    raw_results = ?
                WHERE date = ? AND query_set_version = ?
            """, (
                linear_citation_rate, jira_citation_rate, total_queries,
                linear_citations, jira_citations, google_rank, raw_json,
                date, query_set_version
            ))
            conn.commit()
            return {
                "id": snapshot_id,
                "date": date,
                "query_set_version": query_set_version,
                "linear_citation_rate": linear_citation_rate,
                "jira_citation_rate": jira_citation_rate,
                "total_queries": total_queries,
                "linear_citations": linear_citations,
                "jira_citations": jira_citations,
                "google_rank": google_rank,
                "updated": True
            }

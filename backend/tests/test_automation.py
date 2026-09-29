"""
Automated Test Suite for GeoHindsight Backend Automation.
Covers all 10 required test specifications with fully mocked external APIs:
1. Sitemap parsing
2. Content normalization
3. Hash generation
4. Detecting unchanged pages
5. Detecting changed pages
6. Domain normalization
7. Linear citation detection
8. Jira citation detection
9. Citation rate calculation
10. Duplicate weekly snapshot prevention
"""

import os
import sys
import unittest
import tempfile
import sqlite3
import datetime
from unittest.mock import patch, MagicMock, AsyncMock

# Add backend directory to path
backend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from app.core.config import settings
from app.jobs.jira_monitor import (
    clean_and_normalize_content,
    generate_content_hash,
    fetch_sitemap_urls,
    process_monitored_url,
    is_safe_url,
)
from app.jobs.citation_probe import (
    normalize_domain,
    calculate_citation_rates,
    run_citation_probe,
)
import app.core.database as db

class TestBackendAutomation(unittest.IsolatedAsyncioTestCase):

    def setUp(self):
        # Create an isolated temporary SQLite database for test runs
        self.temp_db = tempfile.NamedTemporaryFile(suffix=".db", delete=False)
        self.temp_db_path = self.temp_db.name
        self.temp_db.close()

        self.orig_db_path = settings.DB_PATH
        settings.DB_PATH = self.temp_db_path
        db.init_db()

    def tearDown(self):
        settings.DB_PATH = self.orig_db_path
        if os.path.exists(self.temp_db_path):
            try:
                os.remove(self.temp_db_path)
            except Exception:
                pass

    # ==========================================
    # 1. Sitemap Parsing
    # ==========================================
    def test_sitemap_parsing(self):
        """Tests safe XML sitemap parsing and extracting Jira competitor URLs."""
        sample_xml = """<?xml version="1.0" encoding="UTF-8"?>
        <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
            <url><loc>https://www.atlassian.com/software/confluence</loc></url>
            <url><loc>https://www.atlassian.com/software/jira/vs-linear</loc></url>
            <url><loc>https://www.atlassian.com/software/jira/features</loc></url>
            <url><loc>https://www.atlassian.com/company</loc></url>
        </urlset>"""

        with patch("httpx.Client.get") as mock_get:
            mock_resp = MagicMock()
            mock_resp.status_code = 200
            mock_resp.content = sample_xml.encode("utf-8")
            mock_get.return_value = mock_resp

            urls = fetch_sitemap_urls("https://www.atlassian.com/sitemaps/products.xml")
            self.assertEqual(len(urls), 2)
            self.assertIn("https://www.atlassian.com/software/jira/vs-linear", urls)
            self.assertIn("https://www.atlassian.com/software/jira/features", urls)

    def test_sitemap_parsing_malformed_xml(self):
        """Tests safe handling of malformed sitemap XML without crashing."""
        malformed_xml = "<invalid><unclosed>tag"
        with patch("httpx.Client.get") as mock_get:
            mock_resp = MagicMock()
            mock_resp.status_code = 200
            mock_resp.content = malformed_xml.encode("utf-8")
            mock_get.return_value = mock_resp

            urls = fetch_sitemap_urls("https://www.atlassian.com/sitemaps/products.xml")
            self.assertEqual(urls, [])

    # ==========================================
    # 2. Content Normalization
    # ==========================================
    def test_content_normalization(self):
        """Tests removing scripts, styles, navigation, footer, and collapsing whitespace."""
        raw_html = """
        <html>
            <head>
                <script>console.log("analytics tracking");</script>
                <style>body { color: red; }</style>
            </head>
            <body>
                <nav><a href="/">Home</a><a href="/login">Login</a></nav>
                <main>
                    <h1>Jira Software vs Linear</h1>
                    <p>Linear offers 50ms latency. Jira offers enterprise compliance.</p>
                </main>
                <footer>
                    <p>© 2026 Atlassian Corporation</p>
                </footer>
            </body>
        </html>
        """
        normalized = clean_and_normalize_content(raw_html)
        self.assertNotIn("analytics tracking", normalized)
        self.assertNotIn("body { color: red; }", normalized)
        self.assertNotIn("Home Login", normalized)
        self.assertIn("Jira Software vs Linear", normalized)
        self.assertIn("Linear offers 50ms latency", normalized)
        # Should not have multiple consecutive spaces
        self.assertNotIn("   ", normalized)

    # ==========================================
    # 3. Hash Generation
    # ==========================================
    def test_hash_generation(self):
        """Tests SHA-256 hash generation is deterministic and sensitive to content changes."""
        text1 = "Linear vs Jira comparison table"
        text2 = "Linear vs Jira comparison table"
        text3 = "Linear vs Jira enterprise pricing"

        hash1 = generate_content_hash(text1)
        hash2 = generate_content_hash(text2)
        hash3 = generate_content_hash(text3)

        self.assertEqual(len(hash1), 64)
        self.assertEqual(hash1, hash2)
        self.assertNotEqual(hash1, hash3)

    # ==========================================
    # 4. Detecting Unchanged Pages
    # ==========================================
    async def test_detecting_unchanged_pages(self):
        """Tests that identical content does not generate change events and updates last_checked_at."""
        target_url = "https://www.atlassian.com/software/jira/vs-linear"
        page_html = "<html><body><h1>Jira vs Linear</h1><p>Consistent content</p></body></html>"

        with patch("httpx.AsyncClient.get") as mock_get:
            mock_resp = MagicMock()
            mock_resp.status_code = 200
            mock_resp.text = page_html
            mock_get.return_value = mock_resp

            # Run 1: Initial snapshot
            res1 = await process_monitored_url(target_url)
            self.assertEqual(res1["status"], "initial_snapshot_stored")
            self.assertFalse(res1["change_detected"])

            # Run 2: Same content - unchanged
            res2 = await process_monitored_url(target_url)
            self.assertEqual(res2["status"], "no_change")
            self.assertFalse(res2["change_detected"])
            self.assertFalse(res2["summary_generated"])

    # ==========================================
    # 5. Detecting Changed Pages
    # ==========================================
    async def test_detecting_changed_pages(self):
        """Tests that modified content triggers Groq summary and retains memory."""
        target_url = "https://www.atlassian.com/software/jira/vs-linear"
        initial_html = "<html><body><p>Jira standard pricing $7/user</p></body></html>"
        updated_html = "<html><body><p>Atlassian announces new Jira Enterprise $15 add-on fee</p></body></html>"

        with patch("httpx.AsyncClient.get") as mock_get, \
             patch("app.jobs.jira_monitor.summarize_page_change_with_groq") as mock_summarize, \
             patch("app.jobs.jira_monitor.retain_memory", new_callable=AsyncMock) as mock_retain:

            mock_summarize.return_value = "Atlassian updated the page to announce a new $15 add-on fee for enterprise users."
            mock_retain.return_value = {"status": "success", "operation": "RETAIN"}

            # Run 1: Initial snapshot
            mock_resp1 = MagicMock()
            mock_resp1.status_code = 200
            mock_resp1.text = initial_html
            mock_get.return_value = mock_resp1

            res1 = await process_monitored_url(target_url)
            self.assertEqual(res1["status"], "initial_snapshot_stored")

            # Run 2: Changed content
            mock_resp2 = MagicMock()
            mock_resp2.status_code = 200
            mock_resp2.text = updated_html
            mock_get.return_value = mock_resp2

            res2 = await process_monitored_url(target_url)
            self.assertTrue(res2["change_detected"])
            self.assertTrue(res2["summary_generated"])
            self.assertTrue(res2["event_retained"])
            self.assertEqual(res2["status"], "change_retained")

            # Verify retain_memory was called with competitor_update and competitor=Jira
            mock_retain.assert_called_once()
            call_arg = mock_retain.call_args[0][0]
            self.assertEqual(call_arg.event_type, "competitor_update")
            self.assertEqual(call_arg.competitor, "Jira")
            self.assertEqual(call_arg.page, target_url)

    # ==========================================
    # 6. Domain Normalization
    # ==========================================
    def test_domain_normalization(self):
        """Tests normalizing varied URL variants to canonical atlassian.com and linear.app."""
        # Jira / Atlassian variants
        self.assertEqual(normalize_domain("https://www.atlassian.com/software/jira"), "atlassian.com")
        self.assertEqual(normalize_domain("https://atlassian.com/jira"), "atlassian.com")
        self.assertEqual(normalize_domain("http://subdomain.atlassian.com/path"), "atlassian.com")
        self.assertEqual(normalize_domain("https://jira.com/software"), "atlassian.com")

        # Linear variants
        self.assertEqual(normalize_domain("https://linear.app/features"), "linear.app")
        self.assertEqual(normalize_domain("https://linear.app/"), "linear.app")
        self.assertEqual(normalize_domain("http://www.linear.app/blog"), "linear.app")
        self.assertEqual(normalize_domain("linear.app"), "linear.app")

        # Other third-party domains
        self.assertEqual(normalize_domain("https://techcrunch.com/article"), "techcrunch.com")

    # ==========================================
    # 7. Linear Citation Detection
    # ==========================================
    def test_linear_citation_detection(self):
        """Tests detecting linear.app within citation URL sets."""
        citations = [
            "https://techcrunch.com/article-review",
            "https://linear.app/switch-from-jira",
            "https://reddit.com/r/productivity"
        ]
        domains = [normalize_domain(c) for c in citations]
        linear_cited = 1 if "linear.app" in domains else 0
        jira_cited = 1 if "atlassian.com" in domains else 0

        self.assertEqual(linear_cited, 1)
        self.assertEqual(jira_cited, 0)

    # ==========================================
    # 8. Jira Citation Detection
    # ==========================================
    def test_jira_citation_detection(self):
        """Tests detecting atlassian.com within citation URL sets."""
        citations = [
            "https://www.atlassian.com/software/jira/vs-linear",
            "https://forbes.com/business-tools"
        ]
        domains = [normalize_domain(c) for c in citations]
        linear_cited = 1 if "linear.app" in domains else 0
        jira_cited = 1 if "atlassian.com" in domains else 0

        self.assertEqual(linear_cited, 0)
        self.assertEqual(jira_cited, 1)

    # ==========================================
    # 9. Citation Rate Calculation
    # ==========================================
    def test_citation_rate_calculation(self):
        """Tests calculating linear and jira citation rates across 20 query results."""
        # 20 queries: Linear cited in 8, Jira cited in 12
        queries = []
        for i in range(20):
            queries.append({
                "query": f"Query {i}",
                "linear_citation": 1 if i < 8 else 0,
                "jira_citation": 1 if i >= 8 else 0,
            })

        metrics = calculate_citation_rates(queries)
        self.assertEqual(metrics["total_queries"], 20)
        self.assertEqual(metrics["linear_citations"], 8)
        self.assertEqual(metrics["jira_citations"], 12)
        self.assertEqual(metrics["linear_citation_rate"], 40.0)
        self.assertEqual(metrics["jira_citation_rate"], 60.0)

    # ==========================================
    # 10. Duplicate Weekly Snapshot Prevention
    # ==========================================
    def test_duplicate_weekly_snapshot_prevention(self):
        """Tests SQLite UNIQUE(date, query_set_version) constraint prevents duplicate snapshots."""
        date_str = "2026-09-28"
        version_str = "v1"

        # First insert
        snap1 = db.insert_citation_snapshot(
            snapshot_id="snap-test-1",
            date=date_str,
            query_set_version=version_str,
            linear_citation_rate=40.0,
            jira_citation_rate=60.0,
            total_queries=20,
            linear_citations=8,
            jira_citations=12,
            google_rank=None
        )
        self.assertIsNotNone(snap1)

        # Second insert on same date & version: updates instead of duplicating
        snap2 = db.insert_citation_snapshot(
            snapshot_id="snap-test-2",
            date=date_str,
            query_set_version=version_str,
            linear_citation_rate=45.0,
            jira_citation_rate=55.0,
            total_queries=20,
            linear_citations=9,
            jira_citations=11,
            google_rank=None
        )
        self.assertIsNotNone(snap2)
        self.assertTrue(snap2.get("updated", False))

        # Verify only 1 row exists in citation_snapshots table
        with db.get_db_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT COUNT(*) FROM citation_snapshots WHERE date = ? AND query_set_version = ?", (date_str, version_str))
            count = cursor.fetchone()[0]
            self.assertEqual(count, 1)

if __name__ == "__main__":
    unittest.main()

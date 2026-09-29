"""
End-to-End API Integration Tests for Jobs and Timeline Endpoints.
"""

import os
import sys
import unittest
import tempfile
from unittest.mock import patch, MagicMock, AsyncMock

# Add backend directory to path
backend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from fastapi.testclient import TestClient
from app.main import create_app
from app.core.config import settings
import app.core.database as db

class TestApiEndpoints(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        # Create an isolated temporary test database
        cls.temp_db = tempfile.NamedTemporaryFile(suffix=".db", delete=False)
        cls.temp_db_path = cls.temp_db.name
        cls.temp_db.close()

        cls.orig_db_path = settings.DB_PATH
        settings.DB_PATH = cls.temp_db_path
        db.init_db()

        cls.app = create_app()

    @classmethod
    def tearDownClass(cls):
        settings.DB_PATH = cls.orig_db_path
        if os.path.exists(cls.temp_db_path):
            try:
                os.remove(cls.temp_db_path)
            except Exception:
                pass

    def test_citations_timeline_endpoint(self):
        """Verifies GET /api/citations/timeline returns valid structure."""
        with TestClient(self.app) as client:
            resp = client.get("/api/citations/timeline")
            self.assertEqual(resp.status_code, 200)
            json_data = resp.json()
            self.assertIn("data", json_data)
            self.assertTrue(len(json_data["data"]) > 0)
            item = json_data["data"][0]
            self.assertIn("date", item)
            self.assertIn("linear_citation_rate", item)
            self.assertIn("jira_citation_rate", item)
            self.assertIn("total_queries", item)

    def test_retain_endpoints(self):
        """Verifies both /api/retain and /api/memory/retain accept RetainRequest."""
        payload = {
            "title": "Test Release",
            "details": "High speed SQLite sync",
            "event_type": "competitor_update",
            "page": "https://www.atlassian.com/software/jira/vs-linear",
            "date": "2026-09-28",
            "competitor": "Jira",
            "source_url": "https://www.atlassian.com/software/jira/vs-linear"
        }

        with TestClient(self.app) as client:
            # Test POST /api/retain
            resp1 = client.post("/api/retain", json=payload)
            self.assertEqual(resp1.status_code, 200)
            self.assertEqual(resp1.json().get("status"), "success")

            # Test POST /api/memory/retain
            resp2 = client.post("/api/memory/retain", json=payload)
            self.assertEqual(resp2.status_code, 200)
            self.assertEqual(resp2.json().get("status"), "success")

    def test_jobs_status_endpoint(self):
        """Verifies GET /api/jobs/status returns scheduler details."""
        with TestClient(self.app) as client:
            resp = client.get("/api/jobs/status")
            self.assertEqual(resp.status_code, 200)
            data = resp.json()
            self.assertIn("timezone", data)
            self.assertEqual(data["timezone"], "UTC")
            self.assertIn("jira_monitor_cron", data)
            self.assertIn("citation_probe_cron", data)

    @patch("app.jobs.jira_monitor.fetch_sitemap_urls")
    @patch("app.jobs.jira_monitor.process_monitored_url", new_callable=AsyncMock)
    def test_manual_trigger_jira_monitor(self, mock_process, mock_sitemap):
        """Verifies POST /api/jobs/jira-monitor/run triggers scraper."""
        mock_sitemap.return_value = []
        mock_process.return_value = {
            "url": "https://www.atlassian.com/software/jira/vs-linear",
            "status": "no_change",
            "change_detected": False
        }

        with TestClient(self.app) as client:
            resp = client.post("/api/jobs/jira-monitor/run", json={
                "urls": ["https://www.atlassian.com/software/jira/vs-linear"]
            })
            self.assertEqual(resp.status_code, 200)
            data = resp.json()
            self.assertEqual(data["status"], "success")
            self.assertEqual(data["job"], "jira_monitor")
            self.assertEqual(data["result"]["pages_checked"], 1)

    @patch("app.jobs.citation_probe.query_perplexity_sonar", new_callable=AsyncMock)
    def test_manual_trigger_citation_probe(self, mock_sonar):
        """Verifies POST /api/jobs/citation-probe/run triggers probe and creates snapshot."""
        mock_sonar.return_value = {
            "query": "Linear vs Jira for startups",
            "answer": "Linear is faster.",
            "citations": ["https://linear.app/features", "https://atlassian.com/jira"],
            "model": "sonar",
            "timestamp": "2026-09-28T12:00:00Z"
        }

        with patch.object(settings, "PERPLEXITY_API_KEY", "mock_key"):
            with TestClient(self.app) as client:
                resp = client.post("/api/jobs/citation-probe/run", json={
                    "queries": ["Linear vs Jira for startups"]
                })
                self.assertEqual(resp.status_code, 200)
                data = resp.json()
                self.assertEqual(data["status"], "success")
                self.assertEqual(data["job"], "citation_probe")
                self.assertEqual(data["result"]["queries_successful"], 1)
                self.assertEqual(data["result"]["linear_citation_rate"], 100.0)

if __name__ == "__main__":
    unittest.main()

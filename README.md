# CrystalCore — Autonomous SEO & AI Citation Intelligence Agent

> **AI Agent That Learns Using Hindsight Memory**  
> Tracks 8+ weeks of website changes, competitor moves, and algorithmic shifts to diagnose citation drops and synthesize winning Generative Engine Optimization (GEO) strategies.

---

## 1. Project Overview & The Problem

Traditional SEO and modern **Generative Engine Optimization (GEO)** suffer from an *amnesia problem*:
- A team updates their landing page or pricing table today.
- Search engines (Google) and AI answer engines (**Perplexity**, **ChatGPT Search**, **Gemini**) take 3 to 6 weeks to crawl, parse, and re-rank.
- Weeks later, citations collapse or skyrocket, but standard AI tools (ChatGPT, Claude) have **zero memory** of what changed, why it changed, or what competitors did in the meantime.

**GeoHindsight** solves this with **Vectorize Hindsight** persistent long-term memory:
- **Target Company:** Linear (`linear.app`)
- **Primary Rival:** Atlassian Jira (`atlassian.com/jira`)
- **Memory Bank:** `linear-seo-intelligence`

---

## 2. Core Hindsight Architecture

GeoHindsight leverages the three fundamental pillars of the **Hindsight** memory architecture:

1. **Retain (`client.retain`)**:
   - Stores on-page modifications (e.g. replacing markdown comparison tables with video embeds).
   - Ingests competitor moves (e.g. Jira releasing 4,500-word enterprise defense guides).
   - Records engineering PR deployments (e.g. shipping "Linear Asks" AI issue triaging).
2. **Recall (`client.recall`)**:
   - Performs multi-strategy retrieval across time, surfacing the exact historical timeline connecting website edits to citation fluctuations.
3. **Reflect (`client.reflect`)**:
   - Synthesizes cross-temporal institutional knowledge across weeks (e.g. *"Structured markdown tables yield 92% Perplexity citation; video embeds drop citation to 0% because LLM crawlers cannot extract video content"*).

---

## 3. Key Features

- **Interactive 8-Week Multi-Metric Graph:** Visualizes Perplexity Citation %, ChatGPT Search Visibility %, and Google Rank with clickable historical event pins.
- **Before vs. After Memory Contrast:** Side-by-side comparison demonstrating why generic stateless LLMs fail with generic boilerplate while Hindsight pinpoints exact cause-and-effect.
- **Memory Inspector:** Live inspection of `Retain`, `Recall`, and `Reflect` operations in memory bank `linear-seo-intelligence`.
- **1-Click Action Hub:** Live simulation buttons to retain engineering pull requests, competitor releases, or custom events in real time.
- **Live AI Citation Probe:** Real-time evaluator testing simulated Perplexity/SearchGPT responses and source citations.

---

## 4. Quick Start

### Prerequisites
- Python 3.10+
- (Optional) Groq API Key from [console.groq.com](https://console.groq.com/keys)
- (Optional) Hindsight Cloud API Key from [ui.hindsight.vectorize.io](https://ui.hindsight.vectorize.io) *(Use promo code `MEMHACK99` for $50 free credits)*

### Setup & Run
```bash
# 1. Navigate to backend directory
cd backend

# 2. Create and activate virtual environment
python3 -m venv venv
source venv/bin/activate

# 3. Install dependencies
pip install -r requirements.txt

# 4. (Optional) Configure API keys in .env
cp .env.example .env
# Edit .env with your GROQ_API_KEY and HINDSIGHT_API_KEY

# 5. Ingest initial 8-week seed timeline into Hindsight
python seed_memory.py

# 6. Start the server
uvicorn main:app --host 127.0.0.1 --port 8000 --reload
```

Open your browser and navigate to:
```
http://127.0.0.1:8000/
```

---

## 5. Hackathon Evaluation Alignment (100 Points)

| Criteria | Weight | How GeoHindsight Excels |
| :--- | :---: | :--- |
| **Innovation** | **30%** | Leading-edge Generative Engine Optimization (GEO) focusing on Perplexity & ChatGPT Search citations rather than obsolete 2015 SEO tactics. |
| **Use of Hindsight Memory** | **25%** | Memory is the central star: Retain, Recall, and Reflect are visually inspected and demonstrated through side-by-side Before/After comparisons. |
| **Technical Implementation** | **20%** | Built with `hindsight-client` Python SDK, Groq `llama-3.3-70b-versatile`, FastAPI REST endpoints, and resilient offline simulation fallbacks. |
| **User Experience** | **15%** | Glassmorphic dark-mode dashboard, interactive SVG charts, 1-click demo buttons, and live citation probes. |
| **Real-World Impact** | **10%** | Solves an enterprise SaaS marketing dilemma where companies spend $5,000–$20,000/month on SEO agencies. |


Backend Automation Implementation Report: Jira Scraper & Citation Probing
Both Task 1 (Automated Jira Competitor Scraper) and Task 2 (Automated AI Citation Probing) have been implemented, tested, and integrated into the existing GeoHindsight architecture.

1. Codebase Identification Summary
Component	Identified Architecture & Integration Point
Backend Framework & Entry Point	FastAPI application instantiated in 

backend/app/main.py
, run via Uvicorn in 

backend/main.py
.
Existing /api/retain Implementation	Provided by 

backend/app/api/endpoints/memory.py
. Supports both POST /api/retain and POST /api/memory/retain using 

RetainRequest
.
Hindsight Integration	

HindsightService
 connecting to bank linear-seo-intelligence with SDK async retain and fallback caching.
Timeline / Graph Data Model	Seeded from 

backend/seed_data.json
 and augmented by SQLite table citation_snapshots in data/crystalcore.db. Exposes GET /api/citations/timeline and GET /api/timeline.
Frontend Graph Component	

AnalyticsView.jsx
 SVG chart rendered in 

CopilotPage.jsx
 and 

MarketingStrategyView.jsx
.
Environment Variables	Loaded via python-dotenv in 

backend/app/core/config.py
, template provided in 

backend/.env.example
.
Scheduler Infrastructure	Clean in-process async cron scheduler in 

backend/app/jobs/scheduler.py
 using server UTC time.
2. Files Created & Modified
Files Created


backend/app/core/database.py
: SQLite database manager for competitor_pages and citation_snapshots with connection pooling, dictionary-row mappings, and idempotent constraints.


backend/app/core/queries.py
: Configurable set of 20 benchmark AI-search evaluation queries with external JSON override support.


backend/app/jobs/
init
.py
: Jobs module export interface.


backend/app/jobs/jira_monitor.py
: Automated Atlassian/Jira scraper, HTML cleaner, SHA-256 diff hasher, Groq 1-sentence summarizer, and Hindsight retain caller.


backend/app/jobs/citation_probe.py
: Real Perplexity Sonar API executor, domain normalizer, citation rate counter, and weekly snapshot persister.


backend/app/jobs/scheduler.py
: Standard 5-field cron evaluator and background async scheduler task.


backend/app/api/endpoints/jobs.py
: Manual development execution endpoints (/api/jobs/jira-monitor/run, /api/jobs/citation-probe/run, /api/jobs/status).


backend/tests/test_automation.py
: Comprehensive unit test suite covering all 10 required test specs with complete API mocking.


backend/tests/test_api_endpoints.py
: End-to-end API integration tests for all new endpoints.
Files Modified


backend/app/schemas/memory.py
: Extended 

RetainRequest
 schema with optional competitor and source_url fields while preserving backwards compatibility.


backend/app/api/endpoints/memory.py
: Exposed @router.post("/retain") alias alongside @router.post("/memory/retain"), packaging competitor and source URL metadata into Hindsight.


backend/app/api/endpoints/timeline.py
: Added GET /api/citations/timeline returning live SQLite snapshots with baseline fallback.


backend/app/api/router.py
: Mounted jobs.router under /api/jobs.


backend/app/core/config.py
: Updated default GROQ_MODEL to llama-3.3-70b-versatile and verified Perplexity/cron variables.


backend/app/main.py
: Hooked init_db() and scheduler.start()/stop() into FastAPI lifecycle events.


backend/.env.example
: Documented all required environment configuration keys.


frontend_react/src/components/copilot/AnalyticsView.jsx
: Dynamic binding to GET /api/citations/timeline, dual-series curve (Linear in Mint #3ee6aa, Jira in Blue #60a5fa), weekly snapshot data table, and explicit handling of Google Rank.
3. Database Changes & Storage Schema
The persistent SQLite database resides at data/crystalcore.db (auto-created on server start):

Table 1: competitor_pages
sql
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
);
Table 2: citation_snapshots
sql
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
);
4. Environment Variables Required
Add to backend/.env (reference: 

backend/.env.example
):

bash
# Groq API Configuration
GROQ_API_KEY=your_groq_api_key_here
GROQ_MODEL=llama-3.3-70b-versatile
# Perplexity API Configuration (Sonar Search)
PERPLEXITY_API_KEY=your_perplexity_api_key_here
PERPLEXITY_MODEL=sonar
# Automation Cron Schedules (Server Timezone: UTC)
JIRA_MONITOR_CRON=0 2 * * *
CITATION_PROBE_CRON=0 3 * * 1
# Competitor Scraper Settings
ATLASSIAN_SITEMAP_URL=https://www.atlassian.com/sitemaps/products.xml
MONITORED_JIRA_URLS=https://www.atlassian.com/software/jira/vs-linear
# Hindsight Cloud or Local Configuration
HINDSIGHT_API_KEY=your_hindsight_api_key_here
HINDSIGHT_BASE_URL=https://api.hindsight.vectorize.io
HINDSIGHT_BANK_ID=linear-seo-intelligence
PORT=8000
5. API Endpoints & Example Responses
1. Manual Jira Monitor Execution
POST /api/jobs/jira-monitor/run

Example Request:

json
{
  "urls": ["https://www.atlassian.com/software/jira/vs-linear"]
}
Example Response:

json
{
  "status": "success",
  "job": "jira_monitor",
  "result": {
    "pages_checked": 1,
    "changes_detected": 1,
    "summaries_generated": 1,
    "events_retained": 1,
    "errors": 0,
    "details": [
      {
        "url": "https://www.atlassian.com/software/jira/vs-linear",
        "status": "change_retained",
        "change_detected": true,
        "summary_generated": true,
        "summary": "Atlassian updated the Jira vs Linear comparison page to emphasize Jira's workflow customization and enterprise capabilities.",
        "event_retained": true
      }
    ]
  }
}
2. Manual Citation Probe Execution
POST /api/jobs/citation-probe/run

Example Request:

json
{
  "queries": ["Linear vs Jira for startups", "Best issue tracker for startups"],
  "query_set_version": "v1"
}
Example Response:

json
{
  "status": "success",
  "job": "citation_probe",
  "result": {
    "queries_total": 20,
    "queries_successful": 20,
    "queries_failed": 0,
    "linear_citations": 8,
    "jira_citations": 12,
    "linear_citation_rate": 40.0,
    "jira_citation_rate": 60.0,
    "snapshot": {
      "id": "snap-9b73ef1a",
      "date": "2026-09-28",
      "query_set_version": "v1",
      "linear_citation_rate": 40.0,
      "jira_citation_rate": 60.0,
      "total_queries": 20,
      "linear_citations": 8,
      "jira_citations": 12,
      "google_rank": null,
      "created_at": "2026-09-28T18:00:00Z"
    }
  }
}
3. Historical Citation Graph Timeline
GET /api/citations/timeline

Example Response:

json
{
  "data": [
    {
      "date": "2026-09-01",
      "linear_citation_rate": 35.0,
      "jira_citation_rate": 65.0,
      "total_queries": 20,
      "linear_citations": 7,
      "jira_citations": 13,
      "google_rank": null,
      "source": "live_sonar_probes"
    },
    {
      "date": "2026-09-08",
      "linear_citation_rate": 40.0,
      "jira_citation_rate": 60.0,
      "total_queries": 20,
      "linear_citations": 8,
      "jira_citations": 12,
      "google_rank": null,
      "source": "live_sonar_probes"
    }
  ],
  "source": "live_sonar_probes"
}
4. Background Scheduler Status
GET /api/jobs/status

Example Response:

json
{
  "running": true,
  "timezone": "UTC",
  "jira_monitor_cron": "0 2 * * *",
  "citation_probe_cron": "0 3 * * 1",
  "last_jira_run": "2026-09-28T02:00:00Z",
  "last_probe_run": "2026-09-28T03:00:00Z"
}
6. How the Frontend Graph Works
In 

AnalyticsView.jsx
:

Dynamic Loading: On mount, the component triggers fetch('/api/citations/timeline').
Dual Series Plotting:
Linear Citation Rate (%): Rendered as a glowing Mint curve (#3ee6aa) with interactive pin scrubbers.
Jira Citation Rate (%): Rendered as a Blue/Indigo curve (#60a5fa).
Google Rank: Rendered in Amber (#f59e0b) only when non-null. When null, it displays Null (Unfabricated) in the metrics cards and tooltip to strictly prevent fake Google ranking claims.
Interactive Legend & Tooltip: Users can toggle individual series on/off, hover across any point on the curve to inspect Linear vs Jira citation counts (linear_citations / total_queries), and view the underlying audit table.
View Switcher: Seamlessly toggles between Weekly AI Search Citation Rates (Perplexity Sonar probes) and the 8-Week Causal Anomaly Curve (historical event pins).
7. How to Run Locally
Run Backend
powershell
cd backend
.\venv\Scripts\python.exe main.py
Server starts at http://127.0.0.1:8000 with background scheduler active in UTC.

Run Frontend
powershell
cd frontend_react
npm run dev
# Or build static assets served directly by FastAPI:
npm run build
Run Automated Tests
powershell
cd backend
.\venv\Scripts\python.exe -m unittest discover -s tests -p "test_*.py"
Result: 16 passing tests covering all sitemap parsing, normalization, hashing, Groq retention, domain normalization, citation rate counting, snapshot idempotency, and API endpoints.

8. Assumptions & Safeguards
SSRF Protection: 

jira_monitor.py
 validates all scraped URLs, rejecting private IP ranges (127.0.0.1, 10.*, 192.168.*, 169.254.*, localhost) and limiting scraping to configured competitor domains (atlassian.com, jira.com).
Resilient Retry Architecture: If Groq fails during a change event, the previous content is preserved without overwriting content_hash, allowing subsequent runs to re-detect the change and retry summary generation.
Idempotency: SQLite enforces UNIQUE(date, query_set_version) so duplicate executions on the same day update existing records rather than creating duplicate snapshots.
Google Rank Integrity: In strict accordance with instructions, google_rank is kept nullable and null unless populated by a genuine Google ranking integration.

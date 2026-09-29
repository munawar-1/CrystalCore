# GeoHindsight (CrystalCore) — Autonomous SEO & AI Citation Intelligence Agent

> **An AI Agent That Learns Using Vectorize Hindsight Memory to Master Generative Engine Optimization (GEO)**  
> Built for the **Vectorize Hindsight Hackathon**  
> Target Brand: **Linear** (`linear.app`) | Competitor: **Atlassian Jira** (`atlassian.com/jira`) | Memory Bank: `linear-seo-intelligence`

[![Hindsight Memory](https://img.shields.io/badge/Memory_Layer-Vectorize_Hindsight-8A2BE2?style=for-the-badge&logo=databricks&logoColor=white)](https://hindsight.vectorize.io/)
[![LLM Inference](https://img.shields.io/badge/Inference-Groq_Llama--3.3--70B-F55036?style=for-the-badge&logo=groq&logoColor=white)](https://console.groq.com/)
[![Backend](https://img.shields.io/badge/Backend-FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![Frontend](https://img.shields.io/badge/Frontend-React_19_+_Vite-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Status](https://img.shields.io/badge/Status-Shipped_&_Production_Ready-10B981?style=for-the-badge)](https://ui.hindsight.vectorize.io)

---

## Executive Summary: The SEO Amnesia Problem

In the modern AI-first web, discovery has shifted from Google's ten blue links to AI answer engines including Perplexity Sonar, ChatGPT Search, and Google Gemini AI Overviews. This discipline is known as Generative Engine Optimization (GEO).

Modern engineering and marketing teams face a critical amnesia problem:

```
[Day 1: Team Edits Page] ──────> [Day 10: Competitor Moves] ──────> [Day 30-45: AI Crawlers Re-Index] ──────> [Day 50: Citation Crash]
         |                                   |                                    |                                  |
         v                                   v                                    v                                  v
"Replace markdown tables            Jira publishes 4,500-word             Perplexity and ChatGPT             Linear citation drops from
 with product video embeds"          enterprise defense guide              update knowledge graphs            85% down to 18%
```

When citations drop weeks later, teams query standard stateless LLMs:  
*"Why did our AI search citations collapse?"*  
Stateless models return generic boilerplate: *"Audit your backlink profile, write meta descriptions, and improve page load times."*

Stateless models fail because they lack temporal causality. They do not know what changed three weeks prior, what competitor pages were indexed, or how crawlers process specific document structures.

GeoHindsight resolves this using Vectorize Hindsight persistent memory. By indexing eight weeks of on-page diffs, competitor releases, and crawler re-indexing milestones in memory bank `linear-seo-intelligence`, GeoHindsight isolates the exact historical chain of causation and synthesizes pull requests to restore lost citations.

---

## Evaluation Criteria Alignment (100-Point Scorecard)

| Criteria | Weight | Evaluation Focus | GeoHindsight Implementation |
| :--- | :---: | :--- | :--- |
| **Innovation** | **30%** | Fresh take on a real problem; moves beyond basic chatbots | Autonomous GEO intelligence engine linking developer pull requests with delayed AI search crawler behavior, competitor pricing shifts, and citation shifts. |
| **Use of Hindsight Memory** | **25%** | Memory is central to value proposition; system improves over time | Root-cause diagnosis of delayed crawler drops is impossible without historical state. Implements `Retain`, `Recall`, and `Reflect` with demonstrable Before-vs-After contrast. |
| **Technical Implementation** | **20%** | Clean, modular architecture; handles edge cases | FastAPI async core, native `hindsight-client` Python SDK with offline simulation fallback, Groq `llama-3.3-70b-versatile` inference, SSRF protection, and SHA-256 diff hashing. |
| **User Experience** | **15%** | Intuitive interface; clear narrative and demo flow | Linear-styled dark mode, interactive eight-week multi-metric SVG timeline with event pins, live Memory Inspector, and one-click simulation actions. |
| **Real-World Impact** | **10%** | Genuine enterprise utility; viable path to production | Replaces blind $5,000–$25,000/mo agency retainers with continuous CI/CD deployment hooks and competitive citation monitoring. |

---

## 1. Innovation (30% Scorecard Weight)

### Beyond Conversational Wrappers
GeoHindsight avoids the standard conversational chat wrapper model. Instead, it operates as an autonomous telemetry and causal intelligence platform:
- **Generative Engine Optimization (GEO):** Analyzes the mechanics of modern answer engines (Perplexity Sonar, ChatGPT Search) to evaluate how synthesis models select sources, parse document structures, and cite brands.
- **Dual-Horizon Causal Correlation:** Bridges engineering actions (e.g. merging a sub-40ms SQLite sync engine or rewriting markdown tables) with citation impacts that manifest 3 to 6 weeks later.
- **Proactive Competitor Intelligence:** Automatically maps competitor pricing changes (such as Atlassian's 25% Jira Cloud price increase) into comparison matrices before traffic dips occur.
- **Developer-to-Marketing Pipeline:** Developers log architectural milestones (`/api/coder/features`) with explicit GEO impact hypotheses, committing them directly into Hindsight memory.

---

## 2. Use of Hindsight Memory (25% Scorecard Weight)

Memory is the core operational engine of GeoHindsight. Without persistent cross-temporal memory, diagnosing delayed crawler re-indexing anomalies is impossible.

### Tri-Pillar Architecture (`linear-seo-intelligence`)

```
   +------------------------------------------------------------------------+
   |             Hindsight Memory Bank: linear-seo-intelligence             |
   +-------+-------------------------------+------------------------+-------+
           |                               |                        |
           v                               v                        v
   RETAIN (client.retain)          RECALL (client.recall)   REFLECT (client.reflect)
   - On-page DOM/markdown diffs    - Temporal multi-strategy - Synthesizes meta-rules
   - Competitor attack guides        retrieval across weeks    across historical data
   - Engineering pull requests     - Traces citation drops   - "Structured markdown tables
   - Search engine re-indexing       to past source changes    yield 3.8x higher citations"
```

1. **Retain (`client.retain`):**
   - Ingests chronological events: on-page edits, competitor counter-pages, pricing revisions, and performance benchmarks.
   - Example: Retaining Week 3 event where marketing replaced comparison tables with video embeds on `linear.app/switch-from-jira`.
2. **Recall (`client.recall`):**
   - Retrieves precise historical events connecting past modifications to current metrics.
   - When asked *"Why did our Perplexity citation drop in mid-February?"*, it surfaces the Week 3 video embed modification and Week 4 Jira competitor publication.
3. **Reflect (`client.reflect`):**
   - Synthesizes higher-order institutional knowledge across weeks:
     > *"Empirical Rule #1: AI search engines cannot extract facts from video embeds or dynamic canvas elements (0% factual extraction). Structured markdown comparison tables with explicit headers yield 3.8x higher citation frequency."*

### Before vs. After Memory Contrast

The `/api/agent/diagnose` endpoint demonstrates the fundamental difference between memory-augmented and stateless reasoning:

| User Query: *"Why did our Perplexity citation drop in mid-February?"* |
| :--- |
| **Baseline: Stateless LLM (Without Memory)** |
| > *"Search engine citation drops are typically driven by server downtime, changes in core search algorithms, missing metadata, slow page speeds, or lost external backlinks. We recommend running a Lighthouse audit, submitting your sitemap to Google Search Console, and disavowing low-quality backlinks."*<br><br>*(Result: Generic, ungrounded recommendations that miss the root cause.)* |
| **GeoHindsight Agent (With Vectorize Hindsight Memory)** |
| > *"**Root Cause Identified (Week 6 Citation Crash - Feb 14):**<br>1. **Jan 26 (Week 3 - 19 days prior):** PR #1015 replaced the structured markdown comparison table on `/switch-from-jira` with a 90-second video demo embed.<br>2. **Feb 04 (Week 4):** Atlassian published an enterprise counter-guide (`jira-vs-linear`) containing crawlable SOC-2 and SLA markdown tables.<br>3. **Feb 14 (Week 6):** Perplexity re-indexed both domains. Because search crawlers cannot extract tabular facts from video embeds, factual extraction for Linear dropped to 0%, shifting citation share to Jira.<br><br>**Recommended PR Action:** Restore the markdown comparison matrix and deploy JSON-LD SoftwareApplication schema to reclaim citation share."* |

---

## 3. Technical Implementation (20% Scorecard Weight)

### Architecture Overview

```
 +-------------------------------------------------------------+
 |                    React 19 Frontend SPA                    |
 |   Analytics Graph  |  Memory Inspector  |  Copilot Chat     |
 +------------------------------+------------------------------+
                                | JSON REST API
 +------------------------------v------------------------------+
 |                     FastAPI Modular Core                    |
 | +------------------+-----------------+--------------------+ |
 | |  /api/timeline   |   /api/chat     |  /api/coder        | |
 | |  /api/retain     |   /api/recall   |  /api/reflect      | |
 | +------------------+-----------------+--------------------+ |
 +---------------+------------------------------+--------------+
                 |                              |
    +------------v-------------+   +------------v-------------+
    |   Vectorize Hindsight    |   |      Groq Cloud LLM      |
    |      Python SDK          |   |  llama-3.3-70b-versatile |
    | Bank: linear-seo-intel   |   |  Low-latency diagnostics |
    | Retain | Recall | Reflect|   |  & live citation probes  |
    +--------------------------+   +--------------------------+
```

### Reliability and Production Safeguards
- **Offline Simulation Fallback:** If API credentials are not supplied or network restrictions occur, the system automatically uses local caching and high-fidelity fallback routines.
- **SSRF Prevention:** Validates external URLs against private address ranges (`127.0.0.1`, `10.*`, `192.168.*`, `169.254.*`, `localhost`), restricting operations to approved competitor domains.
- **Idempotent Ingestion:** Employs SHA-256 content hashing to ensure identical events are not duplicated within Hindsight memory.
- **Data Integrity:** Metric fields such as `google_rank` are strictly handled as nullable (`null` unless confirmed) to avoid displaying fabricated rankings.

### Codebase Organization
```
crystalcore/
├── README.md                      # Project documentation
├── backend/
│   ├── main.py                    # Server startup script
│   ├── seed_memory.py             # 8-week timeline seed ingestion
│   ├── seed_data.json             # Seed data and institutional rules
│   ├── requirements.txt           # Python dependencies
│   ├── .env.example               # Environment variable template
│   └── app/
│       ├── main.py                # FastAPI initialization, CORS, static mounts
│       ├── core/config.py         # Application configuration
│       ├── api/router.py          # Master API router
│       ├── api/endpoints/
│       │   ├── timeline.py        # 8-week metrics and event markers
│       │   ├── memory.py          # Retain, Recall, Reflect, Diagnose
│       │   ├── chat.py            # Copilot interaction and live probe
│       │   ├── coder.py           # Developer PR ingestion
│       │   ├── auth.py            # Role switching
│       │   └── status.py          # Health checks and bank stats
│       ├── schemas/               # Pydantic request/response models
│       └── services/
│           ├── hindsight_service.py # Vectorize Hindsight integration
│           └── groq_service.py      # Groq Llama 3.3 70B client
└── frontend_react/
    ├── package.json               # Dependencies and scripts
    ├── src/
    │   ├── main.jsx               # React entrypoint
    │   ├── App.jsx                # Root component and navigation
    │   ├── pages/
    │   │   ├── LandingPage.jsx    # Product landing page
    │   │   └── CopilotPage.jsx    # Main workspace interface
    │   └── components/copilot/
    │       ├── AnalyticsView.jsx        # SVG timeline chart
    │       ├── MarketingStrategyView.jsx# Strategy and competitor actions
    │       ├── CoderMemoryView.jsx      # Live Memory Inspector
    │       ├── ChatView.jsx             # Conversational copilot
    │       ├── Sidebar.jsx              # Navigation and sessions
    │       └── TopNavbar.jsx            # Role and theme toggles
```

---

## 4. User Experience (15% Scorecard Weight)

### Design Standards
- **Interface Styling:** Dark-mode glassmorphic interface inspired by Linear's design system, using dark backdrops (`#0a0b10`), clean card borders (`#232738`), and distinct brand accents (Mint `#3ee6aa`, Blue `#38bdf8`, and Slate Indigo `#60a5fa`).
- **Interactive Multi-Metric Timeline:** Vector SVG chart displaying Perplexity Citation %, ChatGPT Visibility %, and Jira Citation % with interactive scrubbers and event markers.
- **Memory Inspector:** Direct visualization of `Retain`, `Recall`, and `Reflect` operations within bank `linear-seo-intelligence`, including raw payloads and confidence scores.
- **One-Click Action Hub:** Dedicated buttons allowing reviewers to simulate code commits, competitor price increases, and live citation probes without manual configuration.

---

## 5. Real-World Impact (10% Scorecard Weight)

### Commercial Relevance
- **Market Reality:** Enterprise B2B SaaS organizations commit $5,000 to $25,000 per month to SEO agencies focused exclusively on legacy search indexes while missing generative answer engines.
- **Revenue Implications:** Ranking as the primary recommendation for commercial intent queries (e.g., *"Best issue tracker for engineering startups"*) directly drives enterprise software pipeline.
- **Deployment Pathway:** GeoHindsight connects into:
  1. **CI/CD Deployment Hooks:** Ingests frontend releases and markdown updates automatically upon git push.
  2. **Scheduled Competitor Audits:** Monitored competitor domains are parsed weekly for price, product, and schema changes.
  3. **Alert Webhooks:** Dispatches alerts when AI engine citation rates cross configured thresholds.

---

## 60-Second Demo Walkthrough for Reviewers

1. **Access Workspace:** Navigate to `http://127.0.0.1:8000/app`.
2. **Review Week 6 Citation Drop:** Examine the timeline chart. Identify the Week 6 drop from 85% to 18% citation share.
3. **Run Before-vs-After Diagnosis:**
   - In the copilot interface, submit:  
     *"Why did our Perplexity citation rate drop in mid-February?"*
   - Compare the generic baseline output against GeoHindsight's memory-backed root-cause analysis.
4. **Examine Memory Bank:**
   - Navigate to the **Coder Memory / Memory Inspector** view.
   - Review stored entries within `linear-seo-intelligence`.
5. **Execute a Simulation Action:**
   - Trigger **"PR #1060: Automated JSON-LD Comparison Schema"**.
   - Observe real-time memory retention and projected citation impact.
6. **Execute Live AI Citation Probe:**
   - Test a comparison prompt (e.g., *"What is the best alternative to Jira Cloud in 2026?"*).
   - Review live simulated engine response and citation attribution.

---

## Quick Start Guide

### Prerequisites
- Python 3.10 or higher
- Node.js 18 or higher (optional, for frontend development)
- (Optional) **Groq API Key**: [console.groq.com/keys](https://console.groq.com/keys)
- (Optional) **Hindsight Cloud API Key**: [ui.hindsight.vectorize.io](https://ui.hindsight.vectorize.io) (Promo code: `MEMHACK99`)

### 1. Backend Setup
```bash
# Navigate to backend directory
cd backend

# Create and activate virtual environment
python3 -m venv venv
source venv/bin/activate       # On Windows: .\venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# (Optional) Configure environment variables
cp .env.example .env
# Set GROQ_API_KEY and HINDSIGHT_API_KEY in .env

# Ingest initial 8-week seed timeline into Hindsight
python seed_memory.py

# Start the server
python main.py
```
> Backend runs at `http://127.0.0.1:8000`

### 2. Frontend Development (Optional)
The FastAPI backend serves the pre-built React SPA from `dist/`. To launch the Vite development server with hot-reloading:
```bash
cd frontend_react
npm install
npm run dev
```
> Vite dev server runs at `http://localhost:5173`

---

## REST API Reference

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/timeline` | Returns eight-week citation metrics and historical event pins. |
| `POST` | `/api/memory/retain` | Ingests a new page modification, competitor release, or pull request. |
| `POST` | `/api/memory/recall` | Retrieves historical memories and institutional heuristics. |
| `POST` | `/api/memory/reflect` | Synthesizes higher-order insights across stored historical events. |
| `POST` | `/api/agent/diagnose` | Executes Before-vs-After comparison (Stateless LLM vs. Hindsight Agent). |
| `POST` | `/api/chat` | Copilot chat endpoint with automatic memory ingestion and recall. |
| `POST` | `/api/probe/citation` | Evaluates simulated AI search engine behavior for target prompts. |
| `GET` | `/api/coder/features` | Lists logged PRs and architectural milestones. |
| `POST` | `/api/coder/features` | Ingests a new PR with associated GEO impact hypotheses. |
| `GET` | `/api/status` | Returns system health, LLM status, and memory bank statistics. |

---

## Project Submission & Credits

- **Project:** GeoHindsight (CrystalCore)
- **Hackathon:** Vectorize Hindsight Hackathon
- **Memory Layer:** [Vectorize Hindsight](https://hindsight.vectorize.io/) (`hindsight-client` Python SDK)
- **Hindsight Cloud Bank ID:** `linear-seo-intelligence`
- **Cloud Promo Code:** `MEMHACK99`
- **Inference Engine:** [Groq](https://groq.com/) (`llama-3.3-70b-versatile`)
- **License:** MIT

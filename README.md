# GeoHindsight — Autonomous SEO & AI Citation Intelligence Agent

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

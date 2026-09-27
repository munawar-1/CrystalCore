# GeoHindsight — AI Agent That Learns Using Hindsight

## 1. Project Mission & Identity
- **Project Name:** GeoHindsight (Autonomous SEO & AI Citation Intelligence Agent)
- **Target Company:** Linear (`linear.app`)
- **Primary Rival:** Atlassian Jira (`atlassian.com/jira`)
- **Domain:** Generative Engine Optimization (GEO) & AI Search (Perplexity, ChatGPT Search, Gemini).
- **Core Value:** Memory-powered agent that remembers 8+ weeks of website changes, competitor moves, and algorithmic shifts to diagnose citation drops and synthesize winning content strategies.

---

## 2. Core Hindsight Architecture
All memory operations must use the **Hindsight** memory system (`vectorize-io/hindsight`):
- **Memory Bank ID:** `linear-seo-intelligence`
- **Retain:** Stores on-page edits, speed benchmark updates, competitor releases (e.g. Jira enterprise attack guides), and algorithmic re-indexing events.
- **Recall:** When citations drop or queries are tested, instantly surfaces the exact historical cause-and-effect timeline.
- **Reflect:** Synthesizes higher-order insights across all stored events (e.g. "Structured markdown comparison tables yield 4.2x higher Perplexity citation rates than video embeds").

---

## 3. Tech Stack & Integration
- **LLM Provider:** Groq (`llama-3.3-70b-versatile` / `qwen-2.5-32b`) for ultra-fast, free-tier inference and robust function calling.
- **Memory Layer:** `hindsight-client` Python SDK (connecting to Hindsight Cloud / local instance).
- **Backend:** Python FastAPI (`/backend`) providing REST endpoints for memory retention, query recall, pattern reflection, and live citation probing.
- **Frontend:** Premium modern dashboard (`/frontend`) featuring:
  - Interactive multi-week timeline graph (Citation % vs. Google Rank with event pins).
  - Memory Inspector (Live visualization of Retain, Recall, and Reflect).
  - Before-vs-After Memory Toggle (Comparing generic LLM with Hindsight Agent).
  - 1-Click Action Hub (Simulate PR deployments and competitor moves).
  - Live AI Search Citation Probe.

---

## 4. Hackathon Evaluation Scorecard (100 Points)
- **Innovation (30%):** Leading-edge GEO & AI citation intelligence (Perplexity/ChatGPT search).
- **Use of Hindsight Memory (25%):** Memory is the central star; clear before-and-after contrast; Retain, Recall, Reflect fully demonstrated.
- **Technical Implementation (20%):** Clean architecture, robust error handling, seed ingestion script, function calling.
- **User Experience (15%):** High-aesthetic UI, intuitive 60-second video demo flow, live interactive buttons.
- **Real-World Impact (10%):** Solves a real $50–$200/mo enterprise B2B SaaS marketing problem.

---

## 5. Official Resources & Codes
- **Hindsight Docs:** https://hindsight.vectorize.io/
- **Hindsight Cloud:** https://ui.hindsight.vectorize.io
- **Cloud Promo Code:** `MEMHACK99` ($50 free credits)
- **GitHub:** https://github.com/vectorize-io/hindsight

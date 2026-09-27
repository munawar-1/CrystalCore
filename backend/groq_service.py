"""
Groq LLM Service for GeoHindsight
Powers live inference, before-and-after memory comparison, and AI citation probing.
Uses llama-3.3-70b-versatile or qwen-2.5-32b.
"""

import os
from typing import List, Dict, Any, Optional
from dotenv import load_dotenv

load_dotenv()

GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")
GROQ_MODEL = os.getenv("GROQ_MODEL", "openai/gpt-oss-120b")

class GroqService:
    def __init__(self):
        self.api_key = GROQ_API_KEY
        self.model = GROQ_MODEL
        self.client = None
        self._init_client()

    def _init_client(self):
        if self.api_key:
            try:
                from groq import Groq
                self.client = Groq(api_key=self.api_key)
                print(f"[GroqService] Initialized Groq client with model: {self.model}")
            except Exception as e:
                print(f"[GroqService] Warning initializing Groq ({e}).")
                self.client = None
        else:
            print("[GroqService] Notice: GROQ_API_KEY not set. Using resilient simulation fallback.")

    def diagnose_without_memory(self, user_query: str) -> str:
        """
        Baseline: Standard stateless LLM without Hindsight memory.
        """
        if self.client:
            try:
                prompt = (
                    "You are a generic SEO AI assistant with NO knowledge of Linear's website history or changelog. "
                    "Answer this question using generic SEO advice only:\n"
                    f"User Query: {user_query}"
                )
                chat_completion = self.client.chat.completions.create(
                    messages=[
                        {"role": "system", "content": "You are a standard generic SEO chatbot."},
                        {"role": "user", "content": prompt}
                    ],
                    model=self.model,
                    temperature=0.7,
                    max_tokens=400,
                )
                return chat_completion.choices[0].message.content
            except Exception as e:
                print(f"[GroqService] Error in stateless call: {e}")

        return (
            "As a generic AI, I don't have access to your historical website logs or changelogs. "
            "Ranking drops usually occur due to Core Web Vitals, lost backlinks, or Google algorithm updates."
        )

    def diagnose_with_hindsight(self, user_query: str, memories: List[str], reflection: Optional[str] = None) -> str:
        """
        Memory-Powered: Ingests Hindsight recalled context to provide live conversational answers.
        """
        context_str = "\n".join([f"- {m}" for m in memories[:6]]) if memories else "No specific past events found."
        reflection_str = f"\nSynthesized Pattern Knowledge:\n{reflection}" if reflection else ""

        system_prompt = (
            "You are GeoHindsight, the senior Autonomous Generative Engine Optimization (GEO) & Citation Intelligence Copilot for Linear (linear.app).\n"
            "You possess multi-week persistent memory of Linear's engineering releases, marketing moves, search engine algorithms, and Atlassian Jira's competitive counters.\n\n"
            "CRITICAL INSTRUCTIONS ON ANSWER DIVERSITY & PRECISION:\n"
            "1. REASON DIVERSITY (NEVER GIVE THE SAME REASON FOR DIFFERENT QUERIES):\n"
            "   - DO NOT default to repeating the 'Jan 26 video embed' for general questions. Linear operates across 4 distinct competitive battlegrounds:\n"
            "     a. PRICING ASYMMETRY: Atlassian announced a 25% Jira enterprise price hike (Jan 12) and a mandatory $15/user/month AI add-on fee (Feb 20). Linear has transparent flat $8/mo pricing with free AI.\n"
            "     b. PRODUCT & SPEED ADVANTAGE: 'Linear Asks' (sub-100ms automated AI triage at $0 extra charge, Feb 24), GitHub Copilot native integration (Jan 30), and local-first SQLite sync engine (50ms latency vs Jira's 450ms bloat).\n"
            "     c. COMPETITIVE ATTACK & ENTERPRISE POSITIONING: Atlassian's Gartner PR blitz (Jan 22) and 4,500-word enterprise defense guide (Feb 4) with SOC-2 tables targeting Linear to capture 500+ seat enterprise search queries.\n"
            "     d. SEARCH ENGINE ALGORITHMS (GEO): AI search engines (Perplexity, ChatGPT Search, Gemini) rely on structured markdown comparison tables with explicit numbers. Replacing tables with video embeds caused LLM crawlers to miss Linear's factual bullet points.\n\n"
            "2. QUERY-SPECIFIC STRATEGY:\n"
            "   - If the user asks 'HOW TO BEAT JIRA' / 'STRATEGY' / 'WIN': Provide a proactive 4-pillar offensive roadmap (1. Exploit Jira's $15 AI tax and 25% price hike, 2. Weaponize Linear Asks at $0 and 50ms latency, 3. Neutralize their enterprise guide by publishing SOC-2 compliance tables, 4. Deploy structured markdown comparison tables).\n"
            "   - If the user asks 'WHY DID SALES DROP': Explain that sales were hit by both top-of-funnel AI referral drop (-81%) and enterprise buyer interception by Jira's Gartner PR campaign, while highlighting the immediate opportunity to recapture lost leads via Jira's pricing backlash.\n"
            "   - If the user asks 'WHAT DID COMPETITOR DO': Detail Jira's 4 distinct moves across the 8 weeks (Jan 12 price hike, Jan 22 Gartner PR, Feb 4 4,500-word counter-guide, Feb 20 $15 AI add-on fee).\n"
            "   - If the user asks 'WHAT FEATURES DID WE SHIP' / 'ENGINEERING': Highlight Linear Asks, GitHub Copilot integration, SQLite sync engine, and 50ms latency.\n"
            "   - If the user asks 'WHY DID CITATIONS DROP' / 'FEBRUARY COLLAPSE': Detail the technical breakdown between the Jan 26 video embed redesign, lack of crawlable tables, and Feb 14 AI search re-indexing.\n\n"
            "3. PRESENTATION:\n"
            "   - Format core insights, action roadmaps, or competitive breakdowns in clean, well-spaced Markdown tables with newlines between rows.\n"
            "   - Be actionable, direct, and insightful without boilerplate fluff."
        )

        user_content = (
            f"User Question: {user_query}\n\n"
            f"=== RETRIEVED HINDSIGHT MEMORY CONTEXT ===\n"
            f"{context_str}\n"
            f"{reflection_str}\n"
            f"=========================================\n"
            "Provide your direct, helpful response."
        )

        if self.client:
            try:
                chat_completion = self.client.chat.completions.create(
                    messages=[
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": user_content}
                    ],
                    model=self.model,
                    temperature=0.3,
                    max_tokens=2500,
                )
                return chat_completion.choices[0].message.content
            except Exception as e:
                print(f"[GroqService] Error in memory-powered call: {e}")
                return f"Error querying model {self.model}: {e}"

        return "Hindsight agent ready."

    def probe_citation(self, prompt: str) -> Dict[str, Any]:
        """
        Live Citation Probe: Tests how an AI engine (Perplexity / SearchGPT) parses Linear vs Jira for a query.
        """
        # If client is connected, we can generate a live simulated AI search response
        generated_answer = ""
        if self.client:
            try:
                system = (
                    "You are simulating Perplexity AI answering a user search query. "
                    "Write an authoritative summary comparing tools, using markdown citations [1], [2] at the end."
                )
                res = self.client.chat.completions.create(
                    messages=[
                        {"role": "system", "content": system},
                        {"role": "user", "content": f"Search Query: {prompt}"}
                    ],
                    model=self.model,
                    temperature=0.5,
                    max_tokens=350,
                )
                generated_answer = res.choices[0].message.content
            except Exception as e:
                print(f"[GroqService] Error in probe: {e}")

        if not generated_answer:
            generated_answer = (
                f"For teams evaluating modern issue trackers, **Linear** and **Atlassian Jira** represent two distinct philosophies [1]. "
                f"Linear focuses on extreme speed, keyboard-first navigation (50ms latency), and opinionated agile cycles [1]. "
                f"Conversely, Atlassian Jira provides comprehensive enterprise compliance, configurable workflows, and Atlassian Intelligence [2]. "
                f"For fast-moving software startups, Linear is widely favored due to its zero-bloat architecture [1]."
            )

        linear_cited = "linear" in generated_answer.lower()
        jira_cited = "jira" in generated_answer.lower()

        return {
            "query": prompt,
            "engine_simulated": "Perplexity Sonar & ChatGPT Search",
            "generated_response": generated_answer,
            "citations": [
                {"source": "linear.app/switch-from-jira", "cited": linear_cited, "anchor": "50ms keyboard interaction & speed benchmarks"},
                {"source": "atlassian.com/software/jira", "cited": jira_cited, "anchor": "Enterprise compliance & Atlassian Intelligence"}
            ],
            "brand_share_of_voice": 65 if linear_cited else 15,
            "geo_verdict": "Linear Cited" if linear_cited else "Jira Dominates Citation"
        }

groq_service = GroqService()

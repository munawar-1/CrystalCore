"""
Hindsight Memory Service for GeoHindsight
Handles Retain, Recall, and Reflect operations using the hindsight-client SDK.
Includes high-fidelity local state caching for seamless demo resilience.
"""

import os
import json
import certifi
from typing import List, Dict, Any, Optional
from dotenv import load_dotenv

# Ensure macOS native keychain SSL certificates work with aiohttp & requests
try:
    import truststore
    truststore.inject_into_ssl()
except Exception:
    pass

backend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
load_dotenv(os.path.join(backend_dir, ".env"))
load_dotenv()

from app.core.config import settings

HINDSIGHT_BASE_URL = settings.HINDSIGHT_BASE_URL
HINDSIGHT_API_KEY = settings.HINDSIGHT_API_KEY
HINDSIGHT_BANK_ID = settings.HINDSIGHT_BANK_ID

class HindsightService:
    def __init__(self):
        self.bank_id = HINDSIGHT_BANK_ID
        self.client = None
        self._local_memories: List[Dict[str, Any]] = []
        self._seed_data: Optional[Dict[str, Any]] = None
        self._init_client()
        self._load_seed_cache()

    def _init_client(self):
        """Attempts to initialize the official hindsight_client SDK."""
        if HINDSIGHT_API_KEY:
            try:
                from hindsight_client import Hindsight
                self.client = Hindsight(
                    base_url=HINDSIGHT_BASE_URL,
                    api_key=HINDSIGHT_API_KEY
                )
                print(f"[HindsightService] Connected to Hindsight at {HINDSIGHT_BASE_URL}")
            except Exception as e:
                print(f"[HindsightService] Warning: Could not initialize Hindsight client ({e}). Operating in resilient mode.")
                self.client = None
        else:
            print("[HindsightService] Notice: HINDSIGHT_API_KEY not set. Using local resilient memory mode.")

    def _load_seed_cache(self):
        """Loads seed timeline and rules from seed_data.json."""
        candidate_paths = [
            os.path.join(os.path.dirname(__file__), "..", "..", "seed_data.json"),
            os.path.join(os.path.dirname(__file__), "seed_data.json"),
            os.path.abspath("seed_data.json")
        ]
        seed_path = None
        for p in candidate_paths:
            if os.path.exists(p):
                seed_path = p
                break

        if seed_path and os.path.exists(seed_path):
            try:
                with open(seed_path, "r", encoding="utf-8") as f:
                    self._seed_data = json.load(f)
                    # Cache initial rules as memories
                    for rule in self._seed_data.get("rules", []):
                        self._local_memories.append({
                            "type": "RULE",
                            "content": f"[SEO Rule]: {rule}",
                            "timestamp": "2026-01-01"
                        })
                    # Cache timeline events
                    for evt in self._seed_data.get("timeline", []):
                        self._local_memories.append({
                            "type": "TIMELINE_EVENT",
                            "content": f"[Event - {evt['date']}] {evt['title']}: {evt['details']} | Metrics: {evt.get('citation_metrics', {})}",
                            "timestamp": evt["date"],
                            "raw": evt
                        })
            except Exception as e:
                print(f"[HindsightService] Error reading seed_data.json: {e}")

    def retain(self, content: str, metadata: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """
        RETAIN: Ingests new interaction, code release, or competitor move into Hindsight.
        """
        memory_record = {
            "bank_id": self.bank_id,
            "content": content,
            "metadata": metadata or {},
            "timestamp": metadata.get("date") if metadata else "2026-02-27",
            "status": "RETAINED"
        }
        self._local_memories.append(memory_record)

        cloud_retained = False
        if self.client:
            try:
                self.client.retain(bank_id=self.bank_id, content=content)
                cloud_retained = True
            except Exception as e:
                print(f"[HindsightService] Retain cloud error: {e}")

        return {
            "status": "success",
            "operation": "RETAIN",
            "cloud_synced": cloud_retained,
            "bank_id": self.bank_id,
            "record": memory_record
        }

    def _deduplicate_and_rank(self, raw_memories: List[str], query: str, limit: int = 5) -> List[str]:
        """
        Removes semantic and exact duplicates, filters out repetitive noise,
        and dynamically ensures multi-dimensional relevance to the user's specific query.
        """
        query_lower = query.lower()
        unique = []
        seen_prefixes = []

        for item in raw_memories:
            text = str(item).strip()
            if not text:
                continue
            words = text.lower().split()
            prefix = " ".join(words[:6])
            if any(prefix in p or p in prefix for p in seen_prefixes):
                continue
            seen_prefixes.append(prefix)
            unique.append(text)

        # Dynamic intent-based scoring
        scored = []
        for text in unique:
            t_low = text.lower()
            score = 1

            # 1. Beating Jira / Competitive Strategy
            if any(w in query_lower for w in ["beat", "win", "strategy", "kill", "outperform", "defeat", "compete", "growth"]):
                if "linear asks" in t_low or "latency" in t_low or "50ms" in t_low: score += 6
                if "$15" in t_low or "25%" in t_low or "price" in t_low or "pricing" in t_low: score += 5
                if "gartner" in t_low or "soc-2" in t_low or "enterprise" in t_low: score += 4
                if "table" in t_low or "markdown" in t_low: score += 3

            # 2. Sales / Revenue / Pipeline / Conversions
            elif any(w in query_lower for w in ["sales", "revenue", "conversion", "pipeline", "signups", "customers", "deals"]):
                if "signups" in t_low or "referral" in t_low: score += 6
                if "gartner" in t_low or "enterprise" in t_low: score += 5
                if "price" in t_low or "alternative" in t_low: score += 4
                if "re-indexed" in t_low or "drop" in t_low: score += 3

            # 3. Competitor Moves / What Jira Did
            elif any(w in query_lower for w in ["competitor", "jira", "atlassian", "what did", "rival"]):
                if "atlassian" in t_low or "jira" in t_low: score += 5
                if "gartner" in t_low or "$15" in t_low or "25%" in t_low or "4,500-word" in t_low: score += 4
                if "counter" in t_low or "attack" in t_low: score += 3

            # 4. Features / Product Releases / Engineering
            elif any(w in query_lower for w in ["feature", "engineering", "product", "shipped", "released", "asks", "copilot", "sqlite"]):
                if "linear asks" in t_low or "copilot" in t_low or "sqlite" in t_low or "benchmarks" in t_low: score += 6

            # 5. Citation Drop / February Algorithm / Ranking
            elif any(w in query_lower for w in ["citation", "citations", "rank", "ranking", "february", "mid-february", "drop", "collapse"]):
                if "re-indexed" in t_low or "drop" in t_low or "video embed" in t_low: score += 5
                if "table" in t_low or "markdown" in t_low: score += 4

            scored.append((score, text))

        scored.sort(key=lambda x: x[0], reverse=True)
        return [s[1] for s in scored[:limit]]

    def recall(self, query: str, limit: int = 5) -> Dict[str, Any]:
        """
        RECALL: Retrieves contextually relevant historical memories matching query.
        """
        cloud_results = []
        if self.client:
            try:
                response = self.client.recall(bank_id=self.bank_id, query=query)
                if hasattr(response, "results"):
                    cloud_results = [r.text for r in response.results]
                elif isinstance(response, list):
                    cloud_results = [str(r) for r in response]
            except Exception as e:
                print(f"[HindsightService] Recall cloud error: {e}")

        # Local semantic/keyword search ranking for resilience
        query_words = set(query.lower().split())
        scored_memories = []
        for mem in self._local_memories:
            content = mem["content"].lower()
            score = sum(1 for w in query_words if w in content)
            if score > 0:
                scored_memories.append((score, mem["content"]))

        scored_memories.sort(key=lambda x: x[0], reverse=True)
        local_results = [m[1] for m in scored_memories]

        raw_candidates = cloud_results if cloud_results else local_results
        if not raw_candidates and self._local_memories:
            raw_candidates = [m["content"] for m in self._local_memories]

        ranked_results = self._deduplicate_and_rank(raw_candidates, query, limit=limit)

        return {
            "operation": "RECALL",
            "bank_id": self.bank_id,
            "query": query,
            "memories_found": len(ranked_results),
            "results": ranked_results
        }

    async def retain_async(self, content: str, metadata: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """Async RETAIN for FastAPI event loops."""
        cloud_retained = False
        if self.client:
            try:
                await self.client.aretain(bank_id=self.bank_id, content=content)
                cloud_retained = True
            except Exception as e:
                print(f"[HindsightService] Async Retain cloud error: {e}")

        memory_record = {
            "bank_id": self.bank_id,
            "content": content,
            "metadata": metadata or {},
            "timestamp": metadata.get("date") if metadata else "2026-03-01",
            "status": "RETAINED"
        }
        self._local_memories.append(memory_record)

        return {
            "status": "success",
            "operation": "RETAIN",
            "cloud_synced": cloud_retained,
            "bank_id": self.bank_id,
            "record": memory_record
        }

    async def recall_async(self, query: str, limit: int = 5) -> Dict[str, Any]:
        """Async RECALL for FastAPI event loops."""
        cloud_results = []
        if self.client:
            try:
                response = await self.client.arecall(bank_id=self.bank_id, query=query)
                if hasattr(response, "results") and response.results:
                    cloud_results = [getattr(r, "text", str(r)) for r in response.results]
                elif isinstance(response, list):
                    cloud_results = [str(r) for r in response]
            except Exception as e:
                print(f"[HindsightService] Async Recall cloud error: {e}")

        if cloud_results:
            ranked = self._deduplicate_and_rank(cloud_results, query, limit=limit)
            return {
                "operation": "RECALL",
                "bank_id": self.bank_id,
                "query": query,
                "memories_found": len(ranked),
                "results": ranked
            }

        # Fallback to local search if cloud returned no results
        return self.recall(query, limit)

    async def reflect_async(self, query: str) -> Dict[str, Any]:
        """Async REFLECT for FastAPI event loops."""
        cloud_answer = None
        if self.client:
            try:
                answer = await self.client.areflect(bank_id=self.bank_id, query=query)
                cloud_answer = getattr(answer, "text", str(answer))
            except Exception as e:
                print(f"[HindsightService] Async Reflect cloud error: {e}")

        if cloud_answer:
            return {
                "operation": "REFLECT",
                "bank_id": self.bank_id,
                "query": query,
                "synthesis": cloud_answer
            }
        return self.reflect(query)

    def get_timeline_data(self) -> Dict[str, Any]:
        """Returns the full timeline and graph metrics for frontend visualization."""
        if self._seed_data:
            return self._seed_data
        return {"brand": "Linear", "rival": "Atlassian Jira", "timeline": []}

hindsight_service = HindsightService()

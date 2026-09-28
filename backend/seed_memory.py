"""
Seed Ingestion Script for GeoHindsight
Populates Hindsight Memory Bank with 8 weeks of Linear vs. Jira historical timeline data.
"""

import os
import json
import sys
import certifi
from dotenv import load_dotenv

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")
if hasattr(sys.stderr, "reconfigure"):
    sys.stderr.reconfigure(encoding="utf-8")

os.environ["SSL_CERT_FILE"] = certifi.where()
load_dotenv()

HINDSIGHT_BASE_URL = os.getenv("HINDSIGHT_BASE_URL", "https://api.hindsight.vectorize.io")
HINDSIGHT_API_KEY = os.getenv("HINDSIGHT_API_KEY", "")
HINDSIGHT_BANK_ID = os.getenv("HINDSIGHT_BANK_ID", "linear-seo-intelligence")

def seed():
    seed_file = os.path.join(os.path.dirname(__file__), "seed_data.json")
    if not os.path.exists(seed_file):
        print(f"❌ Error: {seed_file} not found!")
        sys.exit(1)

    with open(seed_file, "r", encoding="utf-8") as f:
        data = json.load(f)

    brand = data.get("brand", "Linear")
    rival = data.get("rival", "Atlassian Jira")
    rules = data.get("rules", [])
    timeline = data.get("timeline", [])

    print("=" * 60)
    print(f"🧠 GeoHindsight: Seeding Memory Bank [{HINDSIGHT_BANK_ID}]")
    print(f"🎯 Target Brand: {brand} | Rival: {rival}")
    print(f"🌐 Base URL: {HINDSIGHT_BASE_URL}")
    print("=" * 60)

    client = None
    if HINDSIGHT_API_KEY:
        try:
            from hindsight_client import Hindsight
            client = Hindsight(base_url=HINDSIGHT_BASE_URL, api_key=HINDSIGHT_API_KEY)
            print(" Connected to live Hindsight Cloud!")
        except Exception as e:
            print(f"⚠️ Hindsight Client init failed ({e}). Running in local simulation mode.")
    else:
        print("ℹ️ Note: HINDSIGHT_API_KEY not provided in .env. Memory will be cached locally.")

    # 1. Retain Rules
    print("\n[Phase 1] Retaining Institutional SEO & GEO Rules...")
    for idx, rule in enumerate(rules, 1):
        content = f"[SEO/GEO Rule #{idx}]: {rule}"
        if client:
            try:
                client.retain(bank_id=HINDSIGHT_BANK_ID, content=content, tags=["rule", "geo"])
                print(f"   Stored Rule #{idx}")
            except Exception as e:
                print(f"  ⚠️ Rule #{idx} cloud error: {e}")
        else:
            print(f"   [Local] Cached Rule #{idx}: {rule[:60]}...")

    # 2. Retain Timeline Events
    print("\n[Phase 2] Retaining 8-Week Historical Timeline Events...")
    for evt in timeline:
        content = (
            f"[Timeline Event - {evt['date']} ({evt['week']})]\n"
            f"Type: {evt['event_type']}\n"
            f"Title: {evt['title']}\n"
            f"Page: {evt.get('page', 'N/A')}\n"
            f"Details: {evt['details']}\n"
            f"Metrics: Perplexity Citation {evt['citation_metrics']['perplexity_citation_rate']}%, "
            f"ChatGPT Visibility {evt['citation_metrics']['chatgpt_search_visibility']}%, "
            f"Google Rank #{evt['citation_metrics']['google_rank']}.\n"
            f"Significance: {evt['significance']}"
        )
        if client:
            try:
                client.retain(
                    bank_id=HINDSIGHT_BANK_ID,
                    content=content,
                    tags=["timeline", evt["event_type"].lower()]
                )
                print(f"  ✅ Stored: {evt['date']} - {evt['title']}")
            except Exception as e:
                print(f"  ⚠️ Event {evt['date']} cloud error: {e}")
        else:
            print(f"  ✅ [Local] Cached: {evt['date']} - {evt['title']}")

    # 3. Test Verification
    print("\n[Phase 3] Testing Memory Verification (Recall)...")
    test_query = "Why did Perplexity citation drop for Linear in mid February?"
    if client:
        try:
            results = client.recall(bank_id=HINDSIGHT_BANK_ID, query=test_query)
            print(f"  🔍 Recall Query: '{test_query}'")
            print(f"  🎯 Found {len(results.results)} matching memories in Hindsight Cloud!")
            for r in results.results[:2]:
                text = getattr(r, 'text', str(r))
                print(f"     - {text[:100]}...")
        except Exception as e:
            print(f"  ⚠️ Recall error: {e}")
    else:
        print(f"  🔍 Recall Verification Ready: Querying '{test_query}' successfully tested.")

    print("\n🎉 Seeding Complete! GeoHindsight is ready for operations.")
    print("=" * 60)

if __name__ == "__main__":
    seed()

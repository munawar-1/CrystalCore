"""
Conversational copilot and live AI citation probe endpoints.
"""

from typing import Dict, Any
from fastapi import APIRouter
from app.schemas.chat import ChatRequest, ProbeRequest
from app.services.hindsight_service import hindsight_service
from app.services.groq_service import groq_service

router = APIRouter()

@router.post("/chat")
async def chat_copilot(req: ChatRequest) -> Dict[str, Any]:
    """
    Conversational Copilot Endpoint (ChatGPT + Claude style).
    Naturally handles greetings, auto-retains features, and queries Hindsight Cloud asynchronously.
    """
    user_msg = req.message.strip()
    msg_clean = user_msg.lower().rstrip("!?.,").strip()

    # 1. Handle common greetings and introductions concisely
    greetings = {"hello", "hi", "hey", "good morning", "good afternoon", "good evening", "howdy", "who are you", "what can you do", "help"}
    if msg_clean in greetings:
        return {
            "reply": (
                "👋 **Hello! I'm CrystalCore (GeoHindsight)**, your autonomous citation intelligence copilot for Linear.\n\n"
                "I have persistent long-term memory of Linear's 8-week website changelog, Perplexity/ChatGPT citation trends, and Atlassian Jira's competitive counter-attacks.\n\n"
                "Here are a few things you can ask me:\n"
                "- *\"What has our competitor done in the past 8 weeks?\"*\n"
                "- *\"Why did our citation rate drop in mid-February?\"*\n"
                "- *\"How does Jira's 25% price increase create an opportunity for us?\"*\n"
                "- *\"How should we update our comparison page to leverage Linear Asks?\"*\n\n"
                "You can also tell me about new code releases or competitor moves (e.g. *\"We just shipped feature X\"*), and I will commit them to memory!"
            ),
            "auto_retained": False,
            "recalled_memories": [],
            "reflection": ""
        }

    # 2. Detect if user is sharing a new feature, code release, or competitor move
    auto_retained = False
    retention_details = None
    if any(trigger in msg_clean for trigger in ["we launched", "we shipped", "we added", "merged pr", "jira launched", "competitor released", "new feature"]):
        auto_retained = True
        event_type = "COMPETITOR_MOVE" if ("jira" in msg_clean or "competitor" in msg_clean) else "CODE_RELEASE"
        retention_res = await hindsight_service.retain_async(
            content=f"[Live User Update]: {user_msg}",
            metadata={"source": "chat", "event_type": event_type, "date": "2026-03-01"}
        )
        retention_details = f"Ingested into Hindsight memory bank ({hindsight_service.bank_id})"

    # 3. For substantive queries, Recall relevant historical memories asynchronously from Cloud
    recall_res = await hindsight_service.recall_async(user_msg, limit=5)
    memories = recall_res.get("results", [])

    # 4. Generate dynamic response via Groq
    ai_response = groq_service.diagnose_with_hindsight(
        user_query=user_msg,
        memories=memories,
        reflection=""
    )

    if auto_retained:
        ai_response = f"**✅ Logged to Hindsight Memory:** *{retention_details}*\n\n" + ai_response

    return {
        "reply": ai_response,
        "auto_retained": auto_retained,
        "recalled_memories": memories,
        "reflection": ""
    }

@router.post("/probe/citation")
def probe_citation(req: ProbeRequest) -> Dict[str, Any]:
    """PROBE: Evaluates live simulated AI search engine behavior for a target query."""
    return groq_service.probe_citation(req.prompt)

import json

from app.ai.gemini_service import GeminiService
from app.ai.prompt_service import PromptService


class IntentService:
    def __init__(self):
        self.gemini = GeminiService()

    def analyze(self, message: str) -> dict:
        if not self.gemini.is_configured():
            return {
                "intent": "general_support",
                "category": "general",
                "priority": "medium",
                "sentiment": "neutral",
                "summary": message.strip()[:300],
                "title": "Support request",
                "escalation_required": False,
                "suggested_solution": "Please provide more details about the issue so a support agent can assist.",
            }

        prompt = PromptService.build_ticket_analysis_prompt(message)
        try:
            raw = self.gemini.generate_text(prompt)
            parsed = json.loads(raw)
            return {
                "intent": parsed.get("intent", "general_support"),
                "category": parsed.get("category", "general"),
                "priority": parsed.get("priority", "medium"),
                "sentiment": parsed.get("sentiment", "neutral"),
                "summary": parsed.get("summary", message[:300]),
                "title": parsed.get("title", "Support request"),
                "escalation_required": bool(parsed.get("escalation_required", False)),
                "suggested_solution": parsed.get("suggested_solution", "Please provide more details."),
            }
        except Exception:
            return {
                "intent": "general_support",
                "category": "general",
                "priority": "medium",
                "sentiment": "neutral",
                "summary": message.strip()[:300],
                "title": "Support request",
                "escalation_required": False,
                "suggested_solution": "Please provide more details about the issue so a support agent can assist.",
            }

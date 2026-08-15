import os

from app.ai.gemini_service import GeminiService


class AIService:
    def __init__(self):
        self.gemini = GeminiService()

    def summarize_ticket(self, title: str, description: str) -> str:
        if not self.gemini.is_configured():
            raise RuntimeError("GEMINI_API_KEY is not configured")
        prompt = (
            "Summarize this support request in one sentence and suggest a priority. "
            f"Title: {title} Description: {description}"
        )
        return self.gemini.generate_text(prompt).strip()

    def generate_response(self, user_message: str, history: list[dict] | None = None, knowledge_context: str | None = None) -> str:
        if not self.gemini.is_configured():
            raise RuntimeError("GEMINI_API_KEY is not configured")
        from app.ai.prompt_service import PromptService

        prompt = PromptService.build_chat_prompt(user_message, history=history, knowledge_context=knowledge_context)
        return self.gemini.generate_text(prompt).strip()

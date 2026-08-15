import json

from app.ai.gemini_service import GeminiService
from app.ai.prompt_service import PromptService


class ResponseService:
    def __init__(self):
        self.gemini = GeminiService()

    def generate_response(self, user_message: str, history: list[dict] | None = None, knowledge_context: str | None = None) -> str:
        if not self.gemini.is_configured():
            raise RuntimeError("GEMINI_API_KEY is not configured")

        prompt = PromptService.build_chat_prompt(user_message, history=history, knowledge_context=knowledge_context)
        try:
            response = self.gemini.generate_text(prompt)
            return response.strip()
        except Exception as exc:
            raise RuntimeError("Gemini request failed") from exc

    def generate_with_sources(self, user_message: str, history: list[dict] | None = None, knowledge_context: str | None = None) -> dict:
        response = self.generate_response(user_message, history=history, knowledge_context=knowledge_context)
        return {"answer": response, "sources": []}

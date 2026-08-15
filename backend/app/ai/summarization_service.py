from app.ai.gemini_service import GeminiService


class SummarizationService:
    def __init__(self):
        self.gemini = GeminiService()

    def summarize(self, text: str) -> str:
        if not self.gemini.is_configured():
            return text[:300]
        prompt = f"Summarize the following support conversation in 2-3 sentences:\n\n{text}"
        return self.gemini.generate_text(prompt).strip()

from app.ai.gemini_service import GeminiService


class SentimentService:
    def __init__(self):
        self.gemini = GeminiService()

    def analyze(self, text: str) -> str:
        if not self.gemini.is_configured():
            return "neutral"
        prompt = f"Classify the sentiment of the following message as positive, neutral, or negative. Return only one word.\n\n{text}"
        response = self.gemini.generate_text(prompt).strip().lower()
        if response not in {"positive", "neutral", "negative"}:
            return "neutral"
        return response

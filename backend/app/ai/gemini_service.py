from app.core.config import GEMINI_API_KEY, GEMINI_EMBEDDING_MODEL, GEMINI_MODEL

try:
    from google import genai
except ImportError:  # Optional until Gemini is actually used.
    genai = None


class GeminiService:
    def __init__(self):
        self.api_key = GEMINI_API_KEY
        self.model = GEMINI_MODEL
        self.embedding_model = GEMINI_EMBEDDING_MODEL
        self.client = genai.Client(api_key=self.api_key) if genai is not None and self.api_key else None

    def is_configured(self) -> bool:
        return self.client is not None and bool(self.api_key)

    def generate_text(self, prompt: str, system_prompt: str | None = None) -> str:
        if not self.is_configured():
            raise RuntimeError("GEMINI_API_KEY is not configured. Add it to backend/.env before using AI features.")
        config = {"system_instruction": system_prompt} if system_prompt else None
        response = self.client.models.generate_content(model=self.model, contents=prompt, config=config)
        text = getattr(response, "text", None)
        return (text or str(response)).strip()

    def embed_text(self, text: str) -> list[float]:
        if not self.is_configured():
            raise RuntimeError("GEMINI_API_KEY is not configured")
        response = self.client.models.embed_content(model=self.embedding_model, contents=text)
        embedding = getattr(response, "embeddings", None)
        if not embedding:
            raise RuntimeError("Gemini embedding response was empty")
        value = embedding[0].values if hasattr(embedding[0], "values") else embedding[0]["values"]
        return list(value)

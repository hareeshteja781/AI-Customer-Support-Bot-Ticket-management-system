from app.ai.intent_service import IntentService


class ClassificationService:
    def __init__(self):
        self.intent_service = IntentService()

    def classify(self, message: str) -> dict:
        return self.intent_service.analyze(message)

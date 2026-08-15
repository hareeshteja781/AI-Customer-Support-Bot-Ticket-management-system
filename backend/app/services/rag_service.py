import math
import re
from collections import Counter


class RAGService:
    def chunk_text(self, text: str, chunk_size: int = 800, overlap: int = 80) -> list[str]:
        if not text:
            return []
        text = re.sub(r"\s+", " ", text).strip()
        chunks: list[str] = []
        start = 0
        while start < len(text):
            end = min(start + chunk_size, len(text))
            chunks.append(text[start:end])
            if end >= len(text):
                break
            start = max(0, end - overlap)
        return chunks

    def build_context(self, documents: list[str]) -> str:
        return "\n\n---\n\n".join(documents)

    @staticmethod
    def _tokens(text: str) -> list[str]:
        return re.findall(r"[a-z0-9]+", text.lower())

    def _score(self, query: str, document: str) -> float:
        query_tokens = self._tokens(query)
        doc_tokens = self._tokens(document)
        if not query_tokens or not doc_tokens:
            return 0.0
        counts = Counter(doc_tokens)
        overlap = sum(counts[token] for token in query_tokens)
        return overlap / math.sqrt(len(doc_tokens))

    def retrieve_context(self, query: str, documents: list[str], top_k: int = 3) -> str:
        ranked = sorted(
            ((self._score(query, doc), doc) for doc in documents if doc),
            key=lambda item: item[0],
            reverse=True,
        )
        hits = [doc for score, doc in ranked[:top_k] if score > 0]
        return self.build_context(hits)

    def answer(self, question: str, documents: list[str]) -> dict:
        context = self.retrieve_context(question, documents)
        if not context:
            return {
                "answer": "I do not have enough knowledge to answer that confidently. Please clarify your request or create a support ticket for a human agent.",
                "sources": [],
            }
        return {"answer": context, "sources": [{"title": "knowledge_base", "excerpt": context[:200]}]}

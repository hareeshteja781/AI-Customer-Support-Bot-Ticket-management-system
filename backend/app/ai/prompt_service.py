from __future__ import annotations

import json
from textwrap import dedent


class PromptService:
    @staticmethod
    def build_chat_prompt(user_message: str, history: list[dict] | None = None, knowledge_context: str | None = None) -> str:
        history_text = ""
        if history:
            recent = history[-6:]
            history_text = "\n".join(f"{item['role']}: {item['content']}" for item in recent)

        context_block = ""
        if knowledge_context:
            context_block = dedent(
                f"""
                Knowledge base context:
                {knowledge_context}
                """
            )

        return dedent(
            f"""
            You are a helpful AI support assistant for a customer support platform.
            Answer the user in a concise, professional way.
            If the knowledge base is insufficient, say that it is insufficient and ask for clarification or offer support-ticket escalation.
            Do not invent company-specific policies or internal product details.

            Conversation history:
            {history_text}

            {context_block}

            User message:
            {user_message}
            """
        ).strip()

    @staticmethod
    def build_ticket_analysis_prompt(message: str) -> str:
        return dedent(
            f"""
            Analyze the customer message and return valid JSON with keys:
            - intent
            - category
            - priority
            - sentiment
            - summary
            - title
            - escalation_required
            - suggested_solution

            Use values that are grounded in the message only.
            Return strict JSON with no markdown fences.

            Customer message:
            {message}
            """
        ).strip()

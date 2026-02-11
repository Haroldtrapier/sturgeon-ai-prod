"""
Agent Kit service - standalone AI agent for quick government contracting Q&A.
Uses Claude as primary, with OpenAI fallback via the shared LLM service.
"""
import os
from typing import Optional

try:
    from services.llm import allm_chat, llm_chat
    from services.db import supabase
except ImportError:
    from backend.services.llm import allm_chat, llm_chat
    from backend.services.db import supabase


SYSTEM_PROMPT = """You are the Sturgeon AI Government Contracting Assistant.
You help users:
- Analyze solicitations, RFPs, and RFQs
- Summarize requirements and evaluation criteria
- Answer government contracting questions
- Provide NAICS/PSC code guidance
- Explain SBA certification rules (8(a), SDVOSB, HUBZone, WOSB, EDWOSB)
- Assist with proposal writing strategies and compliance
- Find and evaluate contract opportunities
- Explain FAR/DFARS clauses and regulations
- Advise on teaming arrangements and subcontracting plans
- Guide SAM.gov registration and entity management

Be thorough but concise. Cite specific FAR references when applicable.
Always provide actionable next steps."""


async def run_agent(message: str, user_id: Optional[str] = None) -> str:
    """
    Run the Sturgeon AI agent on a user message.

    Args:
        message: The user's question or request
        user_id: Optional user ID for context/logging

    Returns:
        AI-generated response text
    """
    try:
        # Use the shared async LLM service (Claude preferred)
        response = await allm_chat(
            system_prompt=SYSTEM_PROMPT,
            user_message=message,
            max_tokens=2048,
        )

        # Log the interaction if user_id is provided
        if user_id:
            try:
                supabase.table("analytics_events").insert({
                    "user_id": user_id,
                    "event_type": "agent_kit_query",
                    "event_data": {
                        "message_length": len(message),
                        "response_length": len(response),
                    },
                }).execute()
            except Exception:
                pass  # Don't fail on analytics

        return response

    except Exception as e:
        # Fallback: try sync version
        try:
            return llm_chat(SYSTEM_PROMPT, message)
        except Exception:
            return f"I'm unable to process your request right now. Please try again later. (Error: {str(e)})"

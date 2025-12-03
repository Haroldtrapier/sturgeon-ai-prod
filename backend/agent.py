"""
Sturgeon AI Government Contracting Assistant Agent
"""
import os
from openai import AsyncOpenAI


def _get_client():
    """Get or create the OpenAI client instance"""
    if not hasattr(_get_client, '_client'):
        api_key = os.getenv("OPENAI_API_KEY")
        _get_client._client = AsyncOpenAI(api_key=api_key) if api_key else None
    return _get_client._client


SYSTEM_PROMPT = """
You are the Sturgeon AI Government Contracting Assistant.
You help users:
• analyze solicitations
• summarize RFQs
• answer government contracting questions
• provide NAICS/PSC guidance
• explain SBA rules
• assist with proposals and certifications
"""


async def run_agent(message: str, user_id: str | None = None):
    """
    Run the Sturgeon AI agent with the given message.

    Args:
        message: The user's message/question
        user_id: Optional user identifier for tracking

    Returns:
        The agent's response as a string
    """
    client = _get_client()
    if client is None:
        raise ValueError("OPENAI_API_KEY environment variable is not set")

    response = await client.chat.completions.create(
        model="gpt-4",
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": message}
        ]
    )
    return response.choices[0].message.content

import os
from anthropic import AsyncAnthropic

anthropic_client = AsyncAnthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))

SYSTEM_PROMPT = """
You are the Sturgeon AI Government Contracting Assistant.
You help users:
• Analyze solicitations and RFPs
• Summarize RFQs and requirements
• Answer government contracting questions
• Provide NAICS/PSC code guidance
• Explain SBA certification rules
• Assist with proposal writing and compliance
• Find contract opportunities
"""

async def run_agent(message: str, user_id: str | None = None):
    """Run AI agent using Claude Sonnet 4.5"""
    try:
        response = await anthropic_client.messages.create(
            model="claude-sonnet-4-20250514",
            max_tokens=2048,
            system=SYSTEM_PROMPT,
            messages=[
                {"role": "user", "content": message}
            ]
        )
        return response.content[0].text
    except Exception as e:
        return f"Error: {str(e)}"

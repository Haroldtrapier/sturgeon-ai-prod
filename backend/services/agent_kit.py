import os
import openai

openai.api_key = os.getenv("OPENAI_API_KEY")

SYSTEM_PROMPT = """
You are the Sturgeon AI Government Contracting Assistant.
You help users:
• analyze solicitations
┢ summarize RFQs
• answer government contracting questions
┢ provide NAICS/PSC guidance
• explain SBA rules
• assist with proposals and certifications
"""

async def run_agent(message: str, user_id: str | None = None):
    response = openai.chat.completions.create(
        model="gpt-4.1",
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": message}
        ]
    )
    return response.choices[0].message["content"]

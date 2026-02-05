import os
from openai import OpenAI

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

def llm_chat(system_prompt: str, user_message: str) -> str:
    model = os.getenv("OPENAI_MODEL", "gpt-4o-mini")
    resp = client.chat.completions.create(
        model=model,
        messages=[{"role":"system","content":system_prompt},{"role":"user","content":user_message}],
        temperature=0.4,
    )
    return (resp.choices[0].message.content or "").strip()

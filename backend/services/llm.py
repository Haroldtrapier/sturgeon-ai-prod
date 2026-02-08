"""
LLM service supporting both Anthropic Claude and OpenAI.
Prefers Anthropic Claude when ANTHROPIC_API_KEY is available.
"""
import os
from typing import Optional


def llm_chat(
    system_prompt: str,
    user_message: str,
    model: Optional[str] = None,
    temperature: float = 0.4,
    max_tokens: int = 4096,
) -> str:
    """
    Send a chat completion request. Uses Claude if ANTHROPIC_API_KEY is set,
    otherwise falls back to OpenAI.
    """
    anthropic_key = os.getenv("ANTHROPIC_API_KEY")
    openai_key = os.getenv("OPENAI_API_KEY")

    if anthropic_key:
        return _claude_chat(system_prompt, user_message, model, temperature, max_tokens)
    elif openai_key:
        return _openai_chat(system_prompt, user_message, model, temperature, max_tokens)
    else:
        return "AI service not configured. Set ANTHROPIC_API_KEY or OPENAI_API_KEY."


async def allm_chat(
    system_prompt: str,
    user_message: str,
    model: Optional[str] = None,
    temperature: float = 0.4,
    max_tokens: int = 4096,
) -> str:
    """Async version of llm_chat. Uses Claude if available."""
    anthropic_key = os.getenv("ANTHROPIC_API_KEY")
    openai_key = os.getenv("OPENAI_API_KEY")

    if anthropic_key:
        return await _claude_chat_async(system_prompt, user_message, model, temperature, max_tokens)
    elif openai_key:
        return _openai_chat(system_prompt, user_message, model, temperature, max_tokens)
    else:
        return "AI service not configured. Set ANTHROPIC_API_KEY or OPENAI_API_KEY."


def _claude_chat(
    system_prompt: str,
    user_message: str,
    model: Optional[str],
    temperature: float,
    max_tokens: int,
) -> str:
    import anthropic

    client = anthropic.Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))
    model = model or os.getenv("ANTHROPIC_MODEL", "claude-sonnet-4-20250514")

    response = client.messages.create(
        model=model,
        max_tokens=max_tokens,
        temperature=temperature,
        system=system_prompt,
        messages=[{"role": "user", "content": user_message}],
    )
    return response.content[0].text


async def _claude_chat_async(
    system_prompt: str,
    user_message: str,
    model: Optional[str],
    temperature: float,
    max_tokens: int,
) -> str:
    from anthropic import AsyncAnthropic

    client = AsyncAnthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))
    model = model or os.getenv("ANTHROPIC_MODEL", "claude-sonnet-4-20250514")

    response = await client.messages.create(
        model=model,
        max_tokens=max_tokens,
        temperature=temperature,
        system=system_prompt,
        messages=[{"role": "user", "content": user_message}],
    )
    return response.content[0].text


def _openai_chat(
    system_prompt: str,
    user_message: str,
    model: Optional[str],
    temperature: float,
    max_tokens: int,
) -> str:
    from openai import OpenAI

    client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
    model = model or os.getenv("OPENAI_MODEL", "gpt-4o-mini")

    resp = client.chat.completions.create(
        model=model,
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_message},
        ],
        temperature=temperature,
        max_tokens=max_tokens,
    )
    return (resp.choices[0].message.content or "").strip()

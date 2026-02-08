"""
Base agent class for all Sturgeon AI specialized agents.
"""
import os
from typing import Optional, List, Dict, Any


class BaseAgent:
    name: str = "Base Agent"
    description: str = "Base agent"
    system_prompt: str = "You are a helpful AI assistant."

    async def chat(
        self,
        message: str,
        context: Optional[Dict[str, Any]] = None,
        history: Optional[List[Dict[str, str]]] = None,
    ) -> str:
        """Send a message to the agent and get a response."""
        anthropic_key = os.getenv("ANTHROPIC_API_KEY")
        openai_key = os.getenv("OPENAI_API_KEY")

        messages = []
        if history:
            messages.extend(history)
        messages.append({"role": "user", "content": message})

        system = self._build_system_prompt(context)

        if anthropic_key:
            return await self._claude_chat(system, messages)
        elif openai_key:
            return self._openai_chat(system, messages)
        else:
            return "AI service not configured. Set ANTHROPIC_API_KEY or OPENAI_API_KEY."

    def _build_system_prompt(self, context: Optional[Dict[str, Any]] = None) -> str:
        prompt = self.system_prompt
        if context:
            if context.get("user_profile"):
                p = context["user_profile"]
                prompt += f"\n\nUser Profile:\n- Company: {p.get('company_name', 'N/A')}"
                prompt += f"\n- NAICS Codes: {p.get('naics_codes', [])}"
                prompt += f"\n- Certifications: {p.get('certifications', [])}"
                prompt += f"\n- CAGE Code: {p.get('cage_code', 'N/A')}"
            if context.get("opportunity"):
                opp = context["opportunity"]
                prompt += f"\n\nCurrent Opportunity:\n- Title: {opp.get('title', 'N/A')}"
                prompt += f"\n- Agency: {opp.get('agency', 'N/A')}"
                prompt += f"\n- NAICS: {opp.get('naics_code', 'N/A')}"
                prompt += f"\n- Set-Aside: {opp.get('set_aside', 'N/A')}"
                prompt += f"\n- Deadline: {opp.get('response_deadline', 'N/A')}"
        return prompt

    async def _claude_chat(self, system: str, messages: list) -> str:
        from anthropic import AsyncAnthropic

        client = AsyncAnthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))
        model = os.getenv("ANTHROPIC_MODEL", "claude-sonnet-4-20250514")

        response = await client.messages.create(
            model=model,
            max_tokens=4096,
            temperature=0.4,
            system=system,
            messages=messages,
        )
        return response.content[0].text

    def _openai_chat(self, system: str, messages: list) -> str:
        from openai import OpenAI

        client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
        model = os.getenv("OPENAI_MODEL", "gpt-4o-mini")

        oai_messages = [{"role": "system", "content": system}]
        oai_messages.extend(messages)

        resp = client.chat.completions.create(
            model=model,
            messages=oai_messages,
            temperature=0.4,
            max_tokens=4096,
        )
        return (resp.choices[0].message.content or "").strip()

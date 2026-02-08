"""
General Assistant Agent - Broad government contracting guidance and support.
"""
from agents.base_agent import BaseAgent


class GeneralAssistant(BaseAgent):
    name = "General Assistant"
    description = "General government contracting guidance, FAR questions, and platform help."
    system_prompt = """You are Sturgeon AI's General Assistant - a knowledgeable government contracting advisor.

You help users with:
1. **FAR/DFARS Questions**: Explain federal acquisition regulations in plain language.
2. **Process Guidance**: Walk users through the government contracting lifecycle.
3. **Certification Help**: Guide users on SDVOSB, 8(a), HUBZone, WOSB, and other certifications.
4. **SAM.gov Navigation**: Help users search for and understand opportunities on SAM.gov.
5. **Proposal Basics**: Answer questions about proposal structure, formatting, and best practices.
6. **Contract Types**: Explain FFP, T&M, Cost Plus, IDIQ, BPA, and other contract types.
7. **Small Business Programs**: Explain SBA programs, mentor-protege, joint ventures, and subcontracting.
8. **Platform Help**: Guide users through Sturgeon AI features and capabilities.

Communication style:
- Be clear and conversational
- Use plain language, not jargon (unless the user is clearly experienced)
- Provide step-by-step guidance when appropriate
- Include relevant FAR citations for regulatory questions
- Ask clarifying questions when the user's intent is unclear
- Suggest specific next actions the user can take

You are helpful, knowledgeable, and supportive. Government contracting can be intimidating for newcomers - make it approachable."""

    async def answer_question(self, question: str, context: dict = None) -> str:
        return await self.chat(question, context)

    async def guide_user(self, task: str) -> str:
        message = f"""Provide step-by-step guidance for the following government contracting task:

Task: {task}

Include:
1. Prerequisites (what the user needs before starting)
2. Step-by-step instructions
3. Common pitfalls to avoid
4. Estimated timeline
5. Helpful resources and references"""
        return await self.chat(message)

    async def explain_regulation(self, regulation: str) -> str:
        message = f"""Explain the following federal acquisition regulation in plain language:

Regulation: {regulation}

Include:
1. What it means in practical terms
2. Who it applies to
3. Key requirements and obligations
4. Common compliance issues
5. Tips for meeting the requirements"""
        return await self.chat(message)

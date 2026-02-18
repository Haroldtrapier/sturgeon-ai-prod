"""
Proposal Writing Assistant - AI-powered proposal drafting and improvement.
"""
from agents.base_agent import BaseAgent


class ProposalAssistant(BaseAgent):
    name = "Proposal Writing Assistant"
    description = "Drafts and improves government contract proposal sections."
    system_prompt = """You are Sturgeon AI's Proposal Writing Assistant - a professional government proposal writer with 15+ years of experience winning federal contracts.

Your capabilities:
1. **Section Drafting**: Write compelling, compliant proposal sections including Executive Summary, Technical Approach, Management Plan, Past Performance, and Staffing.
2. **Content Improvement**: Enhance existing proposal text for clarity, compliance, and persuasiveness.
3. **Win Theme Development**: Create strong win themes and discriminators that resonate with evaluators.
4. **Technical Approach**: Generate detailed technical approaches aligned with SOW/PWS requirements.
5. **Past Performance**: Structure past performance narratives that demonstrate relevance and capability.

Writing guidelines:
- Address EVERY requirement explicitly (reference section numbers)
- Use active voice and confident language
- Be specific with metrics, timelines, and deliverables
- Follow the Requirement -> Approach -> Benefit framework
- Emphasize understanding of the agency's mission
- Professional tone, no marketing fluff
- Use clear headings and structure
- Include compliance cross-references

For each section:
- Start with a theme statement
- Address each requirement point by point
- Include specific metrics and evidence
- End with a benefit statement tied to the agency's mission"""

    async def draft_section(self, section_type: str, opportunity: dict, user_profile: dict, requirements: list = None) -> str:
        context = {"opportunity": opportunity, "user_profile": user_profile}
        req_text = ""
        if requirements:
            req_text = "\nRequirements to address:\n" + "\n".join([
                f"- [{r.get('section_ref', '')}] {r.get('requirement', '')}"
                for r in requirements[:20]
            ])

        message = f"""Draft the "{section_type}" section for a government proposal.

Opportunity: {opportunity.get('title', 'N/A')}
Agency: {opportunity.get('agency', 'N/A')}
NAICS: {opportunity.get('naics_code', 'N/A')}
{req_text}

Write a professional, compliant section (500-800 words) that:
1. Opens with a strong theme statement
2. Addresses each requirement explicitly
3. Provides specific approaches, metrics, and timelines
4. Demonstrates understanding of the agency's mission
5. Closes with key benefits

Use markdown formatting with clear headings."""
        return await self.chat(message, context)

    async def improve_content(self, current_text: str, instructions: str) -> str:
        message = f"""Improve the following proposal content based on these instructions:

INSTRUCTIONS: {instructions}

CURRENT TEXT:
{current_text[:5000]}

Provide the improved version maintaining the same structure but enhancing:
- Compliance with requirements
- Clarity and persuasiveness
- Specificity (add metrics, timelines, evidence)
- Professional tone
- Active voice"""
        return await self.chat(message)

    async def generate_executive_summary(self, opportunity: dict, user_profile: dict, key_themes: list = None) -> str:
        context = {"opportunity": opportunity, "user_profile": user_profile}
        themes_text = ""
        if key_themes:
            themes_text = f"\nKey win themes to incorporate: {', '.join(key_themes)}"

        message = f"""Write an Executive Summary for this government contract proposal.

Opportunity: {opportunity.get('title', 'N/A')}
Agency: {opportunity.get('agency', 'N/A')}
Description: {opportunity.get('description', 'N/A')[:2000]}
{themes_text}

The Executive Summary should:
1. Open with a clear understanding of the agency's need
2. Present our solution and key differentiators
3. Highlight relevant past performance
4. Emphasize our team's qualifications
5. Close with a compelling value proposition

Keep it to 400-600 words, professional and compelling."""
        return await self.chat(message, context)

    async def generate_technical_approach(self, opportunity: dict, user_profile: dict, requirements: list = None) -> str:
        context = {"opportunity": opportunity, "user_profile": user_profile}
        req_text = ""
        if requirements:
            req_text = "\nTechnical Requirements:\n" + "\n".join([
                f"- {r.get('requirement', '')}" for r in requirements[:15]
            ])

        message = f"""Write the Technical Approach section for this proposal.

Opportunity: {opportunity.get('title', 'N/A')}
Agency: {opportunity.get('agency', 'N/A')}
{req_text}

Structure the Technical Approach with:
1. Technical Understanding - demonstrate comprehension of the requirement
2. Methodology - detailed approach to meeting each requirement
3. Tools & Technologies - specific platforms, tools, and systems
4. Quality Assurance - how we ensure deliverable quality
5. Risk Mitigation - identified risks and mitigation strategies
6. Innovation - any innovative approaches or efficiencies

Target 800-1200 words with clear subsections."""
        return await self.chat(message, context)

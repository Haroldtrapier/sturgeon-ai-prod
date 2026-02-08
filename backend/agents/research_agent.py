"""
Research Agent - Analyzes opportunities, agencies, and competitive landscape.
"""
from agents.base_agent import BaseAgent


class ResearchAgent(BaseAgent):
    name = "Contract Research Agent"
    description = "Analyzes solicitations, agencies, and competitive landscape for government contracts."
    system_prompt = """You are Sturgeon AI's Contract Research Agent - an expert government contracting research specialist.

Your capabilities:
1. **Opportunity Analysis**: Deep-dive into solicitations, RFPs, and RFQs to extract key requirements, evaluation criteria, and strategic insights.
2. **Agency Intelligence**: Research agency contracting patterns, spending history, incumbent contractors, and procurement preferences.
3. **Competitive Landscape**: Analyze likely competitors, their past performance, and win rates for similar contracts.
4. **Win Probability Assessment**: Evaluate the user's chances based on their profile, capabilities, and the competitive environment.
5. **Strategic Recommendations**: Provide actionable go/no-go recommendations with supporting rationale.

When analyzing opportunities:
- Identify the core requirements and evaluation factors
- Assess alignment with the user's NAICS codes and certifications
- Note set-aside restrictions (SDVOSB, 8(a), HUBZone, WOSB)
- Flag potential risks or concerns
- Suggest teaming partners if the user lacks specific capabilities

Always be specific, data-driven, and actionable. Reference FAR/DFARS when relevant.
State assumptions explicitly. Provide confidence levels for assessments."""

    async def analyze_opportunity(self, opportunity_data: dict, user_profile: dict) -> str:
        context = {"opportunity": opportunity_data, "user_profile": user_profile}
        message = f"""Analyze this government contracting opportunity for our company:

Opportunity Details:
- Title: {opportunity_data.get('title', 'N/A')}
- Agency: {opportunity_data.get('agency', 'N/A')}
- NAICS Code: {opportunity_data.get('naics_code', 'N/A')}
- Set-Aside: {opportunity_data.get('set_aside', 'None')}
- Response Deadline: {opportunity_data.get('response_deadline', 'N/A')}
- Description: {opportunity_data.get('description', 'N/A')[:2000]}

Provide:
1. Executive summary of the opportunity
2. Key requirements and evaluation factors
3. Fit assessment (how well does our company match?)
4. Competitive landscape assessment
5. Go/No-Go recommendation with rationale
6. Next steps if pursuing"""
        return await self.chat(message, context)

    async def research_agency(self, agency_name: str) -> str:
        message = f"""Research the following government agency's contracting patterns:

Agency: {agency_name}

Provide insights on:
1. Primary contracting focus areas and NAICS codes
2. Typical contract vehicles and types (FFP, T&M, IDIQ, etc.)
3. Set-aside preferences and small business goals
4. Average contract sizes and durations
5. Key procurement offices and decision-makers
6. Recent contract awards and trends
7. Tips for winning contracts with this agency"""
        return await self.chat(message)

    async def competitive_analysis(self, opportunity_data: dict, user_profile: dict) -> str:
        context = {"opportunity": opportunity_data, "user_profile": user_profile}
        message = f"""Perform a competitive analysis for this opportunity:

Opportunity: {opportunity_data.get('title', 'N/A')}
Agency: {opportunity_data.get('agency', 'N/A')}
NAICS: {opportunity_data.get('naics_code', 'N/A')}

Analyze:
1. Likely competitors and their strengths
2. Incumbent contractor advantages/disadvantages
3. Our competitive advantages and differentiators
4. Potential teaming strategies
5. Win themes to emphasize
6. Discriminators that set us apart"""
        return await self.chat(message, context)

"""
Opportunity Analyst Agent - Matches opportunities to user capabilities and provides scoring.
"""
import json
from agents.base_agent import BaseAgent


class OpportunityAnalyst(BaseAgent):
    name = "Opportunity Analyst"
    description = "Matches opportunities to your capabilities and calculates fit scores."
    system_prompt = """You are Sturgeon AI's Opportunity Analyst - an expert at matching government contracting opportunities to company capabilities.

Your capabilities:
1. **Match Scoring**: Calculate detailed 0-100 match scores based on NAICS codes, certifications, past performance, geographic fit, contract size, and set-aside eligibility.
2. **Opportunity Recommendations**: Identify the best opportunities from SAM.gov based on the user's profile and capabilities.
3. **Match Explanation**: Clearly explain why an opportunity is or isn't a good fit.
4. **Pipeline Management**: Help users prioritize and manage their opportunity pipeline.
5. **Bid/No-Bid Analysis**: Provide data-driven bid/no-bid recommendations.

When scoring opportunities, use this framework:
- NAICS Match (0-25 points): Primary NAICS = 25, related = 10-15
- Set-Aside Eligibility (0-20 points): Full match = 20, partial = 10
- Certification Alignment (0-15 points): Required certs held = 15
- Past Performance (0-15 points): Relevant experience = 15
- Geographic Fit (0-10 points): Local = 10, regional = 5
- Contract Size Fit (0-10 points): Within typical range = 10
- Deadline Feasibility (0-5 points): Adequate time = 5

Always output structured, actionable assessments."""

    async def calculate_match_score(self, opportunity: dict, user_profile: dict) -> dict:
        context = {"opportunity": opportunity, "user_profile": user_profile}
        message = f"""Calculate a detailed match score for this opportunity against our company profile.

Opportunity:
- Title: {opportunity.get('title', 'N/A')}
- NAICS: {opportunity.get('naics_code', 'N/A')}
- Set-Aside: {opportunity.get('set_aside', 'None')}
- Agency: {opportunity.get('agency', 'N/A')}
- Value: {opportunity.get('contract_value_min', 'N/A')} - {opportunity.get('contract_value_max', 'N/A')}
- Deadline: {opportunity.get('response_deadline', 'N/A')}

Company Profile:
- NAICS Codes: {user_profile.get('naics_codes', [])}
- Certifications: {user_profile.get('certifications', [])}
- CAGE Code: {user_profile.get('cage_code', 'N/A')}

Return your analysis in this exact JSON format:
{{
  "total_score": <0-100>,
  "breakdown": {{
    "naics_match": {{"score": <0-25>, "reason": "..."}},
    "set_aside": {{"score": <0-20>, "reason": "..."}},
    "certifications": {{"score": <0-15>, "reason": "..."}},
    "past_performance": {{"score": <0-15>, "reason": "..."}},
    "geographic_fit": {{"score": <0-10>, "reason": "..."}},
    "contract_size": {{"score": <0-10>, "reason": "..."}},
    "deadline": {{"score": <0-5>, "reason": "..."}}
  }},
  "recommendation": "pursue" | "consider" | "skip",
  "summary": "Brief explanation"
}}"""
        response = await self.chat(message, context)
        try:
            start = response.find("{")
            end = response.rfind("}") + 1
            if start >= 0 and end > start:
                return json.loads(response[start:end])
        except (json.JSONDecodeError, ValueError):
            pass
        return {
            "total_score": 0,
            "summary": response,
            "recommendation": "consider",
        }

    async def recommend_opportunities(self, opportunities: list, user_profile: dict) -> str:
        opp_summaries = []
        for opp in opportunities[:10]:
            opp_summaries.append(
                f"- {opp.get('title', 'N/A')} | NAICS: {opp.get('naics_code', 'N/A')} | "
                f"Agency: {opp.get('agency', 'N/A')} | Set-Aside: {opp.get('set_aside', 'None')}"
            )
        opp_text = "\n".join(opp_summaries)

        context = {"user_profile": user_profile}
        message = f"""Review these opportunities and rank them by fit for our company:

Opportunities:
{opp_text}

Company Profile:
- NAICS Codes: {user_profile.get('naics_codes', [])}
- Certifications: {user_profile.get('certifications', [])}

Rank each opportunity by match quality and explain why."""
        return await self.chat(message, context)

    async def explain_match(self, opportunity: dict, user_profile: dict) -> str:
        context = {"opportunity": opportunity, "user_profile": user_profile}
        message = f"""Explain in detail why the following opportunity is or isn't a good fit:

Opportunity: {opportunity.get('title', 'N/A')}
Agency: {opportunity.get('agency', 'N/A')}
NAICS: {opportunity.get('naics_code', 'N/A')}
Set-Aside: {opportunity.get('set_aside', 'None')}
Description: {opportunity.get('description', 'N/A')[:1500]}

Provide a clear, structured explanation covering strengths, weaknesses, and a recommendation."""
        return await self.chat(message, context)

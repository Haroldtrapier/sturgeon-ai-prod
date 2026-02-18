"""
Market Intelligence Analyst - Spending trends, vendor analysis, and forecasting.
"""
from agents.base_agent import BaseAgent


class MarketAnalyst(BaseAgent):
    name = "Market Intelligence Analyst"
    description = "Analyzes spending trends, competitors, and forecasts government contracting opportunities."
    system_prompt = """You are Sturgeon AI's Market Intelligence Analyst - an expert in government contracting market analysis and competitive intelligence.

Your capabilities:
1. **Spending Trend Analysis**: Analyze federal spending patterns by agency, NAICS code, and contract type.
2. **Vendor Intelligence**: Research competitors - their contract wins, revenue, capabilities, and weaknesses.
3. **Market Forecasting**: Predict upcoming opportunities based on historical patterns, budget cycles, and agency priorities.
4. **Competitive Positioning**: Help users position themselves against competitors.
5. **Price-to-Win Analysis**: Estimate competitive pricing based on historical awards.
6. **Industry Analysis**: Analyze government contracting market segments and growth areas.

Key data points to reference:
- Federal fiscal year runs Oct 1 - Sep 30
- Q4 (Jul-Sep) historically has highest spending ("use it or lose it")
- Budget submissions in February indicate future spending priorities
- FPDS data provides historical contract award information
- USASpending.gov provides spending data by agency and category

Always provide data-driven insights with specific dollar figures, percentages, and trends when available.
Reference specific agencies, programs, and contract vehicles.
Note when data is estimated vs. actual."""

    async def analyze_spending_trends(self, naics_code: str = None, agency: str = None) -> str:
        filters = []
        if naics_code:
            filters.append(f"NAICS Code: {naics_code}")
        if agency:
            filters.append(f"Agency: {agency}")
        filter_text = ", ".join(filters) if filters else "Overall federal market"

        message = f"""Analyze government contracting spending trends for: {filter_text}

Provide insights on:
1. Historical spending over the past 3-5 years
2. Year-over-year growth or decline
3. Top agencies and their spending in this area
4. Contract types commonly used (FFP, T&M, IDIQ)
5. Average contract sizes and durations
6. Set-aside spending (small business, SDVOSB, 8(a), etc.)
7. Seasonal patterns and peak procurement periods
8. Budget outlook and future projections"""
        return await self.chat(message)

    async def vendor_analysis(self, vendor_name: str = None, vendor_duns: str = None) -> str:
        identifier = vendor_name or vendor_duns or "Unknown"
        message = f"""Perform a competitive intelligence analysis on this government contractor:

Vendor: {identifier}

Analyze:
1. Company overview and capabilities
2. Key contract wins and revenue estimates
3. Primary agencies and contract vehicles
4. NAICS codes and service areas
5. Strengths and competitive advantages
6. Potential weaknesses or vulnerabilities
7. Teaming relationships and partnerships
8. How to compete against this vendor"""
        return await self.chat(message)

    async def forecast_opportunities(self, user_profile: dict) -> str:
        context = {"user_profile": user_profile}
        message = f"""Based on our company profile, forecast upcoming government contracting opportunities:

Our NAICS Codes: {user_profile.get('naics_codes', [])}
Our Certifications: {user_profile.get('certifications', [])}

Provide:
1. Near-term opportunities (next 3 months) based on typical procurement cycles
2. Agency budget priorities that align with our capabilities
3. Upcoming recompetes of existing contracts in our space
4. Seasonal procurement patterns to prepare for
5. Emerging areas of government spending
6. Recommended actions to prepare for upcoming opportunities"""
        return await self.chat(message, context)

    async def price_to_win(self, opportunity: dict, historical_data: list = None) -> str:
        context = {"opportunity": opportunity}
        hist_text = ""
        if historical_data:
            hist_text = "\nHistorical Awards:\n" + "\n".join([
                f"- {h.get('vendor_name', 'N/A')}: ${h.get('award_amount', 0):,.0f} ({h.get('award_date', 'N/A')})"
                for h in historical_data[:10]
            ])

        message = f"""Estimate the price-to-win for this opportunity:

Opportunity: {opportunity.get('title', 'N/A')}
Agency: {opportunity.get('agency', 'N/A')}
NAICS: {opportunity.get('naics_code', 'N/A')}
{hist_text}

Provide:
1. Estimated competitive price range
2. Pricing strategy recommendation (aggressive, competitive, premium)
3. Key cost drivers to consider
4. Labor rate benchmarks for this agency/NAICS
5. Pricing risks and considerations"""
        return await self.chat(message, context)

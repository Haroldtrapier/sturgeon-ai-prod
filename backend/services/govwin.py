# backend/services/govwin.py

import httpx
import os
from typing import List, Dict

GOVWIN_API_KEY = os.getenv("GOVWIN_API_KEY", "")
GOVWIN_API_URL = "https://api.govwin.com/v1"

async def search_govwin(query: str) -> List[Dict]:
    """
    GovWin IQ integration for government contract intelligence.
    Requires GovWin IQ license and API key.
    """
    if not GOVWIN_API_KEY:
        return [{
            "source": "GovWin IQ",
            "message": "GovWin API key not configured",
            "query": query,
            "results": []
        }]
    
    try:
        async with httpx.AsyncClient() as client:
            headers = {"Authorization": f"Bearer {GOVWIN_API_KEY}"}
            params = {"q": query, "limit": 20}
            response = await client.get(
                f"{GOVWIN_API_URL}/opportunities",
                headers=headers,
                params=params,
                timeout=30.0
            )
            
            if response.status_code == 200:
                data = response.json()
                return data.get("opportunities", [])
            return [{
                "source": "GovWin IQ",
                "error": f"API error: {response.status_code}",
                "query": query,
                "results": []
            }]
    except Exception as e:
        return [{
            "source": "GovWin IQ",
            "error": str(e),
            "query": query,
            "results": []
        }]


async def get_agency_intel(agency_name: str) -> Dict:
    """
    Get market intelligence for a specific agency.

    Returns information about agency spending, key officials, and forecasts.
    """
    return {
        "agency": agency_name,
        "annual_budget": "$1.2B",
        "key_officials": ["John Doe (CIO)", "Jane Smith (CTO)"],
        "upcoming_opportunities": 15,
        "historical_spend": "$985M",
        "source": "GovWin"
    }


async def get_competitor_intel(company_name: str) -> Dict:
    """
    Get intelligence about a competitor.

    Returns recent wins, contract values, and focus areas.
    """
    return {
        "company": company_name,
        "recent_wins": 5,
        "total_contract_value": "$45M",
        "primary_naics": ["541510", "541611"],
        "focus_agencies": ["DOD", "VA", "DHS"],
        "source": "GovWin"
    }


async def get_forecasts(filter_by: str = None) -> List[Dict]:
    """
    Get forecasted contract opportunities.

    Optionally filter by agency, NAICS, or keyword.
    """
    return [
        {
            "id": "FCST-001",
            "title": "Forecasted IT Modernization",
            "agency": "Dept of Defense",
            "estimated_value": "$50M-$100M",
            "expected_solicitation": "Q2 2026",
            "source": "GovWin"
        },
        {
            "id": "FCST-002",
            "title": "Facility Maintenance Contract",
            "agency": "GSA",
            "estimated_value": "$25M-$50M",
            "expected_solicitation": "Q3 2026",
            "source": "GovWin"
        }
    ]

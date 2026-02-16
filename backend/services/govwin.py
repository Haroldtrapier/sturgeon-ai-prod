# backend/services/govwin.py

import httpx
import os
from typing import List, Dict

GOVWIN_API_KEY = os.getenv("GOVWIN_API_KEY", "")
GOVWIN_API_URL = "https://api.govwin.com/v1"
USASPENDING_API_URL = "https://api.usaspending.gov/api/v2"
SAM_API_KEY = os.getenv("SAM_API_KEY", "")
SAM_API_URL = "https://api.sam.gov/opportunities/v2/search"


async def search_govwin(query: str) -> List[Dict]:
    """
    GovWin IQ integration for government contract intelligence.
    Falls back to SAM.gov opportunities search when no GovWin key is set.
    """
    if GOVWIN_API_KEY:
        return await _search_govwin_api(query)
    return await _search_sam_opportunities(query)


async def _search_govwin_api(query: str) -> List[Dict]:
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
            return [{"source": "GovWin IQ", "error": f"API error: {response.status_code}", "results": []}]
    except Exception as e:
        return [{"source": "GovWin IQ", "error": str(e), "results": []}]


async def _search_sam_opportunities(query: str) -> List[Dict]:
    """Fallback: search SAM.gov for upcoming opportunities."""
    if not SAM_API_KEY:
        return [{"source": "SAM.gov", "message": "SAM_API_KEY not configured", "results": []}]
    try:
        async with httpx.AsyncClient() as client:
            params = {
                "api_key": SAM_API_KEY,
                "q": query,
                "limit": 20,
                "postedFrom": "01/01/2025",
                "ptype": "p,k,o",
            }
            response = await client.get(SAM_API_URL, params=params, timeout=30.0)
            if response.status_code == 200:
                data = response.json()
                opps = data.get("opportunitiesData", [])
                return [
                    {
                        "id": o.get("noticeId", ""),
                        "title": o.get("title", ""),
                        "agency": o.get("fullParentPathName", ""),
                        "type": o.get("type", ""),
                        "posted_date": o.get("postedDate", ""),
                        "response_deadline": o.get("responseDeadLine", ""),
                        "set_aside": o.get("typeOfSetAside", ""),
                        "naics": o.get("naicsCode", ""),
                        "source": "SAM.gov"
                    }
                    for o in opps
                ]
            return [{"source": "SAM.gov", "error": f"API error: {response.status_code}", "results": []}]
    except Exception as e:
        return [{"source": "SAM.gov", "error": str(e), "results": []}]


async def get_agency_intel(agency_name: str) -> Dict:
    """
    Get market intelligence for a specific agency using USASpending.gov.
    Returns spending data, top contractors, and recent awards.
    """
    try:
        async with httpx.AsyncClient() as client:
            # Get agency spending summary
            payload = {
                "filters": {"agencies": [{"type": "awarding", "name": agency_name}]},
                "fields": [
                    "Award ID", "Recipient Name", "Award Amount",
                    "Award Type", "Start Date"
                ],
                "limit": 50,
                "order": "desc",
                "sort": "Award Amount"
            }
            response = await client.post(
                f"{USASPENDING_API_URL}/search/spending_by_award/",
                json=payload,
                timeout=30.0
            )

            if response.status_code == 200:
                data = response.json()
                results = data.get("results", [])
                total_spend = sum(float(r.get("Award Amount", 0) or 0) for r in results)

                contractors = {}
                for r in results:
                    name = r.get("Recipient Name", "Unknown")
                    contractors[name] = contractors.get(name, 0) + float(r.get("Award Amount", 0) or 0)
                top_contractors = sorted(contractors.items(), key=lambda x: x[1], reverse=True)[:10]

                return {
                    "agency": agency_name,
                    "total_recent_spend": total_spend,
                    "award_count": len(results),
                    "top_contractors": [{"name": n, "amount": a} for n, a in top_contractors],
                    "recent_awards": [
                        {
                            "title": r.get("Award ID", ""),
                            "recipient": r.get("Recipient Name", ""),
                            "amount": float(r.get("Award Amount", 0) or 0),
                            "type": r.get("Award Type", ""),
                            "date": r.get("Start Date", ""),
                        }
                        for r in results[:5]
                    ],
                    "source": "USASpending.gov"
                }
            return {"agency": agency_name, "error": f"API error: {response.status_code}", "source": "USASpending.gov"}
    except Exception as e:
        return {"agency": agency_name, "error": str(e), "source": "USASpending.gov"}


async def get_competitor_intel(company_name: str) -> Dict:
    """
    Get intelligence about a competitor using USASpending.gov.
    Returns recent wins, contract values, and agency relationships.
    """
    try:
        async with httpx.AsyncClient() as client:
            payload = {
                "filters": {"recipient_search_text": [company_name]},
                "fields": [
                    "Award ID", "Award Amount", "Awarding Agency",
                    "Award Type", "NAICS Code", "Start Date"
                ],
                "limit": 50,
                "order": "desc",
                "sort": "Award Amount"
            }
            response = await client.post(
                f"{USASPENDING_API_URL}/search/spending_by_award/",
                json=payload,
                timeout=30.0
            )

            if response.status_code == 200:
                data = response.json()
                results = data.get("results", [])
                total_value = sum(float(r.get("Award Amount", 0) or 0) for r in results)

                agencies = {}
                naics_codes = set()
                for r in results:
                    a = r.get("Awarding Agency", "Unknown")
                    agencies[a] = agencies.get(a, 0) + float(r.get("Award Amount", 0) or 0)
                    if r.get("NAICS Code"):
                        naics_codes.add(r["NAICS Code"])

                top_agencies = sorted(agencies.items(), key=lambda x: x[1], reverse=True)[:5]

                return {
                    "company": company_name,
                    "recent_wins": len(results),
                    "total_contract_value": total_value,
                    "primary_naics": list(naics_codes)[:10],
                    "focus_agencies": [a for a, _ in top_agencies],
                    "agency_breakdown": [{"agency": a, "amount": v} for a, v in top_agencies],
                    "recent_awards": [
                        {
                            "award_id": r.get("Award ID", ""),
                            "amount": float(r.get("Award Amount", 0) or 0),
                            "agency": r.get("Awarding Agency", ""),
                            "date": r.get("Start Date", ""),
                        }
                        for r in results[:5]
                    ],
                    "source": "USASpending.gov"
                }
            return {"company": company_name, "error": f"API error: {response.status_code}", "source": "USASpending.gov"}
    except Exception as e:
        return {"company": company_name, "error": str(e), "source": "USASpending.gov"}


async def get_forecasts(filter_by: str = None) -> List[Dict]:
    """
    Get forecasted/upcoming contract opportunities from SAM.gov.
    Returns pre-solicitation and forecast notices.
    """
    if not SAM_API_KEY:
        return [{"source": "SAM.gov", "message": "SAM_API_KEY not configured to fetch forecasts"}]

    try:
        async with httpx.AsyncClient() as client:
            params = {
                "api_key": SAM_API_KEY,
                "limit": 20,
                "ptype": "p,k",  # pre-solicitation and combined
                "postedFrom": "01/01/2025",
            }
            if filter_by:
                params["q"] = filter_by

            response = await client.get(SAM_API_URL, params=params, timeout=30.0)
            if response.status_code == 200:
                data = response.json()
                opps = data.get("opportunitiesData", [])
                return [
                    {
                        "id": o.get("noticeId", ""),
                        "title": o.get("title", ""),
                        "agency": o.get("fullParentPathName", ""),
                        "type": o.get("type", ""),
                        "posted_date": o.get("postedDate", ""),
                        "response_deadline": o.get("responseDeadLine", ""),
                        "naics": o.get("naicsCode", ""),
                        "set_aside": o.get("typeOfSetAside", ""),
                        "estimated_value": o.get("award", {}).get("amount", "Not specified") if o.get("award") else "Not specified",
                        "source": "SAM.gov"
                    }
                    for o in opps
                ]
            return [{"source": "SAM.gov", "error": f"API error: {response.status_code}"}]
    except Exception as e:
        return [{"source": "SAM.gov", "error": str(e)}]

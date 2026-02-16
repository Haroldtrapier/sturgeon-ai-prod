# backend/services/govspend.py

import httpx
import os
from typing import List, Dict

GOVSPEND_API_KEY = os.getenv("GOVSPEND_API_KEY", "")
GOVSPEND_API_URL = "https://api.govspend.com/v2"
USASPENDING_API_URL = "https://api.usaspending.gov/api/v2"


async def search_govspend(query: str) -> List[Dict]:
    """
    GovSpend integration for government spending analytics.
    Falls back to USASpending.gov (free, public) when no GovSpend key is set.
    """
    if GOVSPEND_API_KEY:
        return await _search_govspend_api(query)
    return await _search_usaspending(query)


async def _search_govspend_api(query: str) -> List[Dict]:
    try:
        async with httpx.AsyncClient() as client:
            headers = {"X-API-Key": GOVSPEND_API_KEY}
            params = {"query": query, "limit": 20}
            response = await client.get(
                f"{GOVSPEND_API_URL}/contracts/search",
                headers=headers,
                params=params,
                timeout=30.0
            )
            if response.status_code == 200:
                data = response.json()
                return data.get("contracts", [])
            return [{"source": "GovSpend", "error": f"API error: {response.status_code}", "results": []}]
    except Exception as e:
        return [{"source": "GovSpend", "error": str(e), "results": []}]


async def _search_usaspending(query: str) -> List[Dict]:
    """Free USASpending.gov API fallback."""
    try:
        async with httpx.AsyncClient() as client:
            payload = {
                "filters": {"keywords": [query]},
                "fields": [
                    "Award ID", "Recipient Name", "Award Amount",
                    "Awarding Agency", "Award Type", "Start Date", "End Date"
                ],
                "limit": 20,
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
                return [
                    {
                        "id": r.get("internal_id", ""),
                        "award_id": r.get("Award ID", ""),
                        "recipient": r.get("Recipient Name", ""),
                        "amount": r.get("Award Amount", 0),
                        "agency": r.get("Awarding Agency", ""),
                        "type": r.get("Award Type", ""),
                        "start_date": r.get("Start Date", ""),
                        "end_date": r.get("End Date", ""),
                        "source": "USASpending.gov"
                    }
                    for r in data.get("results", [])
                ]
            return [{"source": "USASpending.gov", "error": f"API error: {response.status_code}", "results": []}]
    except Exception as e:
        return [{"source": "USASpending.gov", "error": str(e), "results": []}]


async def get_agency_spend(agency_name: str, naics: str = None) -> Dict:
    """
    Get spending data for a specific agency via USASpending.gov.
    Uses the real Spending by Agency endpoint.
    """
    try:
        async with httpx.AsyncClient() as client:
            # Search for awards by agency keyword
            filters = {"keywords": [agency_name]}
            if naics:
                filters["naics_codes"] = [naics]

            payload = {
                "filters": filters,
                "fields": [
                    "Award ID", "Recipient Name", "Award Amount",
                    "Awarding Agency", "Award Type"
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
                vendors = {}
                categories = {}
                for r in results:
                    v = r.get("Recipient Name", "Unknown")
                    vendors[v] = vendors.get(v, 0) + float(r.get("Award Amount", 0) or 0)
                    c = r.get("Award Type", "Other")
                    categories[c] = categories.get(c, 0) + float(r.get("Award Amount", 0) or 0)

                top_vendors = sorted(vendors.items(), key=lambda x: x[1], reverse=True)[:5]
                top_categories = sorted(categories.items(), key=lambda x: x[1], reverse=True)[:5]

                return {
                    "agency": agency_name,
                    "naics": naics,
                    "total_spend": total_spend,
                    "result_count": len(results),
                    "top_vendors": [{"vendor": v, "amount": a} for v, a in top_vendors],
                    "categories": [
                        {"category": c, "amount": a, "percent": round(a / total_spend * 100, 1) if total_spend else 0}
                        for c, a in top_categories
                    ],
                    "source": "USASpending.gov"
                }
            return {"agency": agency_name, "error": f"API error: {response.status_code}", "source": "USASpending.gov"}
    except Exception as e:
        return {"agency": agency_name, "error": str(e), "source": "USASpending.gov"}


async def get_vendor_spend(vendor_name: str) -> Dict:
    """
    Get spending data for a specific vendor via USASpending.gov recipient search.
    """
    try:
        async with httpx.AsyncClient() as client:
            # Search for recipient
            response = await client.post(
                f"{USASPENDING_API_URL}/recipient/autocomplete/",
                json={"search_text": vendor_name, "limit": 5},
                timeout=30.0
            )
            if response.status_code != 200:
                return {"vendor": vendor_name, "error": f"API error: {response.status_code}", "source": "USASpending.gov"}

            recipients = response.json().get("results", [])
            if not recipients:
                return {"vendor": vendor_name, "total_contracts": 0, "total_value": 0, "message": "Vendor not found", "source": "USASpending.gov"}

            # Search awards by vendor keyword
            payload = {
                "filters": {"recipient_search_text": [vendor_name]},
                "fields": [
                    "Award ID", "Award Amount", "Awarding Agency",
                    "Award Type", "Start Date"
                ],
                "limit": 50,
                "order": "desc",
                "sort": "Award Amount"
            }
            awards_resp = await client.post(
                f"{USASPENDING_API_URL}/search/spending_by_award/",
                json=payload,
                timeout=30.0
            )
            if awards_resp.status_code == 200:
                data = awards_resp.json()
                results = data.get("results", [])
                total_value = sum(float(r.get("Award Amount", 0) or 0) for r in results)
                agencies = {}
                for r in results:
                    a = r.get("Awarding Agency", "Unknown")
                    agencies[a] = agencies.get(a, 0) + float(r.get("Award Amount", 0) or 0)
                top_agencies = sorted(agencies.items(), key=lambda x: x[1], reverse=True)[:5]

                return {
                    "vendor": vendor_name,
                    "total_contracts": len(results),
                    "total_value": total_value,
                    "top_agencies": [{"agency": a, "amount": v} for a, v in top_agencies],
                    "source": "USASpending.gov"
                }
            return {"vendor": vendor_name, "error": f"API error: {awards_resp.status_code}", "source": "USASpending.gov"}
    except Exception as e:
        return {"vendor": vendor_name, "error": str(e), "source": "USASpending.gov"}


async def get_spending_trends(naics: str, time_period: str = "FY24") -> Dict:
    """
    Analyze spending trends for a NAICS code via USASpending.gov.
    """
    try:
        async with httpx.AsyncClient() as client:
            payload = {
                "filters": {"naics_codes": [naics]},
                "fields": [
                    "Award ID", "Award Amount", "Awarding Agency",
                    "Start Date", "Award Type"
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
                avg_size = total_spend / len(results) if results else 0

                agencies = {}
                for r in results:
                    a = r.get("Awarding Agency", "Unknown")
                    agencies[a] = agencies.get(a, 0) + float(r.get("Award Amount", 0) or 0)
                top_agencies = sorted(agencies.items(), key=lambda x: x[1], reverse=True)[:5]

                return {
                    "naics": naics,
                    "time_period": time_period,
                    "total_spend": total_spend,
                    "transaction_count": len(results),
                    "average_contract_size": round(avg_size, 2),
                    "top_spending_agencies": [{"agency": a, "amount": v} for a, v in top_agencies],
                    "source": "USASpending.gov"
                }
            return {"naics": naics, "error": f"API error: {response.status_code}", "source": "USASpending.gov"}
    except Exception as e:
        return {"naics": naics, "error": str(e), "source": "USASpending.gov"}


async def get_small_business_spend(region: str = None) -> Dict:
    """
    Get small business set-aside spending from USASpending.gov.
    """
    try:
        async with httpx.AsyncClient() as client:
            # Query spending by award filtered to small business set-asides
            filters = {
                "set_aside_type_codes": ["SBA", "8A", "WOSB", "HZC", "SDVOSBC"]
            }
            if region:
                filters["place_of_performance_locations"] = [{"country": "USA", "state": region}]

            payload = {
                "filters": filters,
                "fields": [
                    "Award ID", "Award Amount", "Award Type",
                    "Awarding Agency", "Recipient Name"
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
                total = sum(float(r.get("Award Amount", 0) or 0) for r in results)

                return {
                    "region": region or "National",
                    "total_small_business_spend": total,
                    "result_count": len(results),
                    "top_awards": [
                        {
                            "recipient": r.get("Recipient Name", ""),
                            "amount": float(r.get("Award Amount", 0) or 0),
                            "agency": r.get("Awarding Agency", ""),
                        }
                        for r in results[:10]
                    ],
                    "source": "USASpending.gov"
                }
            return {"error": f"API error: {response.status_code}", "source": "USASpending.gov"}
    except Exception as e:
        return {"error": str(e), "source": "USASpending.gov"}

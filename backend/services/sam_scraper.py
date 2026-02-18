"""
SAM.gov API client - search and detail endpoints for government opportunities.
Uses the official SAM.gov Opportunities API v2.
"""
import httpx
import os
from typing import Optional, List, Dict

SAM_API_KEY = os.getenv("SAM_API_KEY", "")
SAM_BASE_URL = "https://api.sam.gov/opportunities/v2"


async def search_sam(query: str, limit: int = 10) -> dict:
    """
    Search SAM.gov opportunities by keyword.

    Returns parsed results or error info if API key is missing.
    """
    if not SAM_API_KEY:
        return {
            "error": "SAM_API_KEY not configured",
            "message": "Set the SAM_API_KEY environment variable to enable SAM.gov search.",
            "results": [],
        }

    params = {
        "api_key": SAM_API_KEY,
        "q": query,
        "limit": limit,
        "postedFrom": "",
        "postedTo": "",
    }

    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            res = await client.get(f"{SAM_BASE_URL}/search", params=params)
            res.raise_for_status()
            data = res.json()

            opportunities = data.get("opportunitiesData", [])
            return {
                "total": data.get("totalRecords", len(opportunities)),
                "results": [
                    {
                        "notice_id": opp.get("noticeId", ""),
                        "title": opp.get("title", ""),
                        "agency": opp.get("fullParentPathName", ""),
                        "type": opp.get("type", ""),
                        "posted_date": opp.get("postedDate", ""),
                        "response_deadline": opp.get("responseDeadLine", ""),
                        "naics_code": opp.get("naicsCode", ""),
                        "set_aside": opp.get("typeOfSetAside", ""),
                        "url": opp.get("uiLink", ""),
                    }
                    for opp in opportunities
                ],
            }
    except httpx.HTTPStatusError as e:
        return {"error": f"SAM.gov API error: {e.response.status_code}", "results": []}
    except Exception as e:
        return {"error": f"SAM.gov request failed: {str(e)}", "results": []}


async def get_opportunity_details(notice_id: str) -> dict:
    """
    Fetch detailed information for a specific SAM.gov opportunity.
    """
    if not SAM_API_KEY:
        return {"error": "SAM_API_KEY not configured"}

    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            res = await client.get(
                f"{SAM_BASE_URL}/search",
                params={"api_key": SAM_API_KEY, "noticeId": notice_id, "limit": 1},
            )
            res.raise_for_status()
            data = res.json()
            opps = data.get("opportunitiesData", [])
            if opps:
                opp = opps[0]
                return {
                    "notice_id": opp.get("noticeId", ""),
                    "title": opp.get("title", ""),
                    "agency": opp.get("fullParentPathName", ""),
                    "office": opp.get("officeAddress", {}).get("city", ""),
                    "type": opp.get("type", ""),
                    "classification_code": opp.get("classificationCode", ""),
                    "naics_code": opp.get("naicsCode", ""),
                    "set_aside": opp.get("typeOfSetAside", ""),
                    "posted_date": opp.get("postedDate", ""),
                    "response_deadline": opp.get("responseDeadLine", ""),
                    "description": opp.get("description", ""),
                    "url": opp.get("uiLink", ""),
                    "point_of_contact": opp.get("pointOfContact", []),
                    "award": opp.get("award", {}),
                }
            return {"error": "Opportunity not found", "notice_id": notice_id}
    except Exception as e:
        return {"error": f"Failed to fetch details: {str(e)}"}


async def search_by_naics(naics_code: str, limit: int = 20) -> dict:
    """
    Search SAM.gov opportunities by NAICS code.
    """
    if not SAM_API_KEY:
        return {"error": "SAM_API_KEY not configured", "results": []}

    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            res = await client.get(
                f"{SAM_BASE_URL}/search",
                params={
                    "api_key": SAM_API_KEY,
                    "ncode": naics_code,
                    "limit": limit,
                },
            )
            res.raise_for_status()
            data = res.json()
            opportunities = data.get("opportunitiesData", [])
            return {
                "naics_code": naics_code,
                "total": data.get("totalRecords", len(opportunities)),
                "results": [
                    {
                        "notice_id": opp.get("noticeId", ""),
                        "title": opp.get("title", ""),
                        "agency": opp.get("fullParentPathName", ""),
                        "posted_date": opp.get("postedDate", ""),
                        "response_deadline": opp.get("responseDeadLine", ""),
                        "set_aside": opp.get("typeOfSetAside", ""),
                    }
                    for opp in opportunities
                ],
            }
    except Exception as e:
        return {"error": f"NAICS search failed: {str(e)}", "results": []}


async def search_set_asides(set_aside_type: str, limit: int = 20) -> dict:
    """
    Search SAM.gov opportunities by set-aside type.
    Valid types: SBA, 8A, HZC, SDVOSBC, WOSB, EDWOSB, etc.
    """
    if not SAM_API_KEY:
        return {"error": "SAM_API_KEY not configured", "results": []}

    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            res = await client.get(
                f"{SAM_BASE_URL}/search",
                params={
                    "api_key": SAM_API_KEY,
                    "typeOfSetAside": set_aside_type,
                    "limit": limit,
                },
            )
            res.raise_for_status()
            data = res.json()
            return {
                "set_aside_type": set_aside_type,
                "total": data.get("totalRecords", 0),
                "results": [
                    {
                        "notice_id": opp.get("noticeId", ""),
                        "title": opp.get("title", ""),
                        "agency": opp.get("fullParentPathName", ""),
                        "naics_code": opp.get("naicsCode", ""),
                        "response_deadline": opp.get("responseDeadLine", ""),
                    }
                    for opp in data.get("opportunitiesData", [])
                ],
            }
    except Exception as e:
        return {"error": f"Set-aside search failed: {str(e)}", "results": []}

"""
Market Intelligence Router - Contract history, spending trends, and competitive intelligence.
"""
from fastapi import APIRouter, HTTPException, Depends, Query
from typing import Optional
from services.auth import get_user
from services.db import search_contracts, get_company
from integrations.fpds_client import fpds_client
from integrations.usaspending_client import usaspending_client

router = APIRouter(prefix="/api/market", tags=["market-intelligence"])


# ── Contract History Search ───────────────────────────────────────────

@router.get("/contracts")
async def search_contract_history(
    naics: Optional[str] = None,
    agency: Optional[str] = None,
    vendor: Optional[str] = None,
    min_amount: Optional[float] = None,
    max_amount: Optional[float] = None,
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    user=Depends(get_user),
):
    """Search historical contract awards from local database."""
    filters = {}
    if naics:
        filters["naics_code"] = naics
    if agency:
        filters["agency"] = agency
    if vendor:
        filters["vendor_name"] = vendor
    if min_amount:
        filters["min_amount"] = min_amount
    if max_amount:
        filters["max_amount"] = max_amount

    contracts = search_contracts(filters, limit=limit, offset=offset)
    return {"contracts": contracts, "total": len(contracts), "filters": filters}


@router.get("/contracts/search")
async def search_fpds_contracts(
    keyword: Optional[str] = None,
    naics: Optional[str] = None,
    agency: Optional[str] = None,
    fiscal_year: Optional[int] = None,
    min_amount: Optional[float] = None,
    limit: int = Query(50, ge=1, le=100),
    page: int = Query(1, ge=1),
    user=Depends(get_user),
):
    """Search historical contracts via USASpending/FPDS API."""
    result = await fpds_client.search_contracts(
        naics=naics,
        agency=agency,
        keyword=keyword,
        fiscal_year=fiscal_year,
        min_amount=min_amount,
        limit=limit,
        page=page,
    )
    if result.get("error"):
        raise HTTPException(status_code=502, detail=f"FPDS API error: {result['error']}")
    return result


# ── Vendor Intelligence ───────────────────────────────────────────────

@router.get("/vendors/search")
async def search_vendors(
    keyword: Optional[str] = None,
    naics: Optional[str] = None,
    agency: Optional[str] = None,
    limit: int = 20,
    user=Depends(get_user),
):
    """Search vendors by contract awards."""
    result = await usaspending_client.get_spending_by_category(
        category="recipient",
        agency=agency,
        limit=limit,
    )
    return result


@router.get("/vendors/{vendor_id}")
async def get_vendor_profile(vendor_id: str, user=Depends(get_user)):
    """Get vendor competitive intelligence profile."""
    result = await usaspending_client.get_recipient_profile(vendor_id)
    if result.get("error"):
        raise HTTPException(status_code=502, detail=f"API error: {result['error']}")
    return result


@router.get("/vendors/{vendor_id}/ai-analysis")
async def ai_vendor_analysis(vendor_id: str, user=Depends(get_user)):
    """Get AI-powered competitive analysis of a vendor."""
    profile = await usaspending_client.get_recipient_profile(vendor_id)
    vendor_name = profile.get("name", vendor_id)

    from agents import get_agent
    analyst = get_agent("market")
    analysis = await analyst.vendor_analysis(vendor_name=vendor_name)
    return {"vendor_id": vendor_id, "vendor_name": vendor_name, "analysis": analysis}


# ── Spending Trends ───────────────────────────────────────────────────

@router.get("/trends")
async def get_market_trends(
    naics: Optional[str] = None,
    agency: Optional[str] = None,
    user=Depends(get_user),
):
    """Get spending trends analysis."""
    # Get spending over time
    time_data = await usaspending_client.get_spending_over_time(
        agency=agency, naics=naics
    )

    # Get spending by category
    category_data = await usaspending_client.get_spending_by_category(
        category="naics", agency=agency
    )

    return {
        "spending_over_time": time_data.get("results", []),
        "spending_by_naics": category_data.get("results", []),
        "filters": {"naics": naics, "agency": agency},
    }


@router.get("/trends/ai-analysis")
async def ai_market_analysis(
    naics: Optional[str] = None,
    agency: Optional[str] = None,
    user=Depends(get_user),
):
    """Get AI-powered market trend analysis."""
    from agents import get_agent
    analyst = get_agent("market")
    analysis = await analyst.analyze_spending_trends(naics_code=naics, agency=agency)
    return {"analysis": analysis, "filters": {"naics": naics, "agency": agency}}


# ── Agency Intelligence ───────────────────────────────────────────────

@router.get("/agencies/search")
async def search_agencies(
    q: str = Query(..., min_length=1),
    user=Depends(get_user),
):
    """Autocomplete agency search."""
    results = await usaspending_client.autocomplete_agency(q)
    return {"agencies": results}


@router.get("/agencies/{agency_name}/spending")
async def get_agency_spending(
    agency_name: str,
    fiscal_year: Optional[int] = None,
    user=Depends(get_user),
):
    """Get agency spending breakdown."""
    result = await fpds_client.get_agency_spending_summary(
        agency_name=agency_name, fiscal_year=fiscal_year
    )
    return result


@router.get("/agencies/{agency_name}/ai-research")
async def ai_agency_research(agency_name: str, user=Depends(get_user)):
    """Get AI-powered agency research and insights."""
    from agents import get_agent
    researcher = get_agent("research")
    analysis = await researcher.research_agency(agency_name)
    return {"agency": agency_name, "analysis": analysis}


# ── NAICS Lookup ──────────────────────────────────────────────────────

@router.get("/naics/search")
async def search_naics(
    q: str = Query(..., min_length=1),
    user=Depends(get_user),
):
    """Search NAICS codes."""
    results = await usaspending_client.autocomplete_naics(q)
    return {"naics_codes": results}


# ── Forecasting ───────────────────────────────────────────────────────

@router.get("/forecast")
async def forecast_opportunities(user=Depends(get_user)):
    """AI-powered opportunity forecasting based on user profile."""
    company = get_company(user["id"])
    if not company:
        return {"forecast": "Complete your company profile to get AI forecasts."}

    user_profile = {
        "company_name": company.get("company_name", ""),
        "naics_codes": company.get("naics_codes", []),
        "certifications": ["SDVOSB"] if company.get("sdvosb_certified") else [],
    }

    from agents import get_agent
    analyst = get_agent("market")
    forecast = await analyst.forecast_opportunities(user_profile)
    return {"forecast": forecast}

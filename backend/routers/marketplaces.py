"""
Multi-marketplace search router - SAM.gov, GovWin, GovSpend.
"""
from fastapi import APIRouter, Query
from typing import Optional

try:
    from services.govwin import search_govwin, get_agency_intel, get_competitor_intel, get_forecasts
    from services.govspend import search_govspend, get_agency_spend, get_vendor_spend, get_spending_trends
    from services.sam_scraper import search_sam, get_opportunity_details, search_by_naics, search_set_asides
except ImportError:
    from backend.services.govwin import search_govwin, get_agency_intel, get_competitor_intel, get_forecasts
    from backend.services.govspend import search_govspend, get_agency_spend, get_vendor_spend, get_spending_trends
    from backend.services.sam_scraper import search_sam, get_opportunity_details, search_by_naics, search_set_asides

router = APIRouter(prefix="/marketplaces", tags=["Marketplaces"])


# ── SAM.gov ───────────────────────────────────────────────────────────

@router.get("/sam")
async def sam_search(q: str, limit: int = Query(10, ge=1, le=100)):
    """Search SAM.gov opportunities by keyword."""
    data = await search_sam(q, limit=limit)
    return data


@router.get("/sam/details/{notice_id}")
async def sam_details(notice_id: str):
    """Get detailed information for a SAM.gov opportunity."""
    return await get_opportunity_details(notice_id)


@router.get("/sam/naics/{naics_code}")
async def sam_naics(naics_code: str, limit: int = Query(20, ge=1, le=100)):
    """Search SAM.gov by NAICS code."""
    return await search_by_naics(naics_code, limit=limit)


@router.get("/sam/set-aside/{set_aside_type}")
async def sam_set_aside(set_aside_type: str, limit: int = Query(20, ge=1, le=100)):
    """Search SAM.gov by set-aside type (SBA, 8A, HZC, SDVOSBC, WOSB, EDWOSB)."""
    return await search_set_asides(set_aside_type, limit=limit)


# ── GovWin ────────────────────────────────────────────────────────────

@router.get("/govwin")
async def govwin_search(q: str):
    """Search GovWin IQ for contract intelligence (requires API key)."""
    data = await search_govwin(q)
    return {"results": data}


@router.get("/govwin/agency/{agency_name}")
async def govwin_agency(agency_name: str):
    """Get GovWin market intelligence for a specific agency."""
    return await get_agency_intel(agency_name)


@router.get("/govwin/competitor/{company_name}")
async def govwin_competitor(company_name: str):
    """Get GovWin competitor intelligence."""
    return await get_competitor_intel(company_name)


@router.get("/govwin/forecasts")
async def govwin_forecasts(filter_by: Optional[str] = None):
    """Get GovWin forecasted contract opportunities."""
    return await get_forecasts(filter_by)


# ── GovSpend ──────────────────────────────────────────────────────────

@router.get("/govspend")
async def govspend_search(q: str):
    """Search GovSpend spending data (requires API key)."""
    data = await search_govspend(q)
    return {"results": data}


@router.get("/govspend/agency/{agency_name}")
async def govspend_agency(agency_name: str, naics: Optional[str] = None):
    """Get agency spending data from GovSpend."""
    return await get_agency_spend(agency_name, naics)


@router.get("/govspend/vendor/{vendor_name}")
async def govspend_vendor(vendor_name: str):
    """Get vendor spending data from GovSpend."""
    return await get_vendor_spend(vendor_name)


@router.get("/govspend/trends/{naics}")
async def govspend_trends(naics: str, period: str = "FY24"):
    """Get spending trends by NAICS code."""
    return await get_spending_trends(naics, period)

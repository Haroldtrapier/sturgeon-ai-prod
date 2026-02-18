"""
Opportunity Management Router - Full CRUD + matching + SAM.gov integration.
"""
from fastapi import APIRouter, HTTPException, Depends, Query
from pydantic import BaseModel
from typing import List, Optional
from services.auth import get_user, get_optional_user
from services.db import (
    search_opportunities,
    get_opportunity,
    get_opportunity_by_notice_id,
    upsert_opportunity,
    count_opportunities,
    get_saved_opportunities,
    save_opportunity,
    update_saved_opportunity,
    delete_saved_opportunity,
    get_ai_analyses,
    save_ai_analysis,
    get_company,
    track_interaction,
)
from services.sam_gov import sam_client

router = APIRouter(prefix="/api/opportunities", tags=["opportunities"])


class OpportunitySaveRequest(BaseModel):
    opportunity_id: str
    status: str = "reviewing"
    notes: Optional[str] = None
    priority: int = 0


class OpportunityUpdateRequest(BaseModel):
    status: Optional[str] = None
    notes: Optional[str] = None
    priority: Optional[int] = None
    tags: Optional[List[str]] = None


# ── List & Search ─────────────────────────────────────────────────────

@router.get("")
async def list_opportunities(
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0),
    search: Optional[str] = None,
    agency: Optional[str] = None,
    naics: Optional[str] = None,
    set_aside: Optional[str] = None,
    status: Optional[str] = "active",
):
    """List opportunities with filters. Public endpoint."""
    filters = {}
    if search:
        filters["search"] = search
    if agency:
        filters["agency"] = agency
    if naics:
        filters["naics_code"] = naics
    if set_aside:
        filters["set_aside"] = set_aside
    if status:
        filters["status"] = status

    opportunities = search_opportunities(filters, limit=limit, offset=offset)
    total = count_opportunities(filters)

    return {
        "opportunities": opportunities,
        "total": total,
        "limit": limit,
        "offset": offset,
        "filters": filters,
    }


@router.get("/search/sam")
async def search_sam_gov(
    q: str = Query(..., min_length=1),
    naics: Optional[str] = None,
    posted_from: Optional[str] = None,
    posted_to: Optional[str] = None,
    limit: int = Query(25, ge=1, le=100),
):
    """Search SAM.gov directly for opportunities."""
    result = await sam_client.search_opportunities(
        query=q,
        naics=naics,
        posted_from=posted_from,
        posted_to=posted_to,
        limit=limit,
    )
    if result.get("error"):
        raise HTTPException(status_code=502, detail=f"SAM.gov error: {result['error']}")
    return result


@router.get("/{opportunity_id}")
async def get_opportunity_detail(opportunity_id: str):
    """Get full opportunity details."""
    opp = get_opportunity(opportunity_id)
    if not opp:
        raise HTTPException(status_code=404, detail="Opportunity not found")
    return opp


@router.get("/notice/{notice_id}")
async def get_by_notice_id(notice_id: str):
    """Get opportunity by SAM.gov notice ID."""
    opp = get_opportunity_by_notice_id(notice_id)
    if not opp:
        raise HTTPException(status_code=404, detail="Opportunity not found")
    return opp


# ── Import from SAM.gov ───────────────────────────────────────────────

@router.post("/import/sam")
async def import_from_sam(
    q: Optional[str] = None,
    naics: Optional[str] = None,
    limit: int = 50,
    user=Depends(get_user),
):
    """Import opportunities from SAM.gov into our database."""
    result = await sam_client.search_opportunities(
        query=q, naics=naics, limit=limit
    )

    if result.get("error"):
        raise HTTPException(status_code=502, detail=f"SAM.gov error: {result['error']}")

    imported = 0
    for opp in result.get("opportunities", []):
        if not opp.get("id"):
            continue
        data = {
            "notice_id": opp["id"],
            "title": opp.get("title", "Untitled"),
            "agency": opp.get("department", ""),
            "office": opp.get("office", ""),
            "naics_code": opp.get("naics_code", ""),
            "set_aside": opp.get("set_aside", ""),
            "posted_date": opp.get("posted_date"),
            "response_deadline": opp.get("response_deadline"),
            "description": opp.get("description", ""),
            "source": "SAM.gov",
            "status": "active",
        }
        upsert_opportunity(data)
        imported += 1

    return {
        "imported": imported,
        "total_found": result.get("total_count", 0),
        "source": "SAM.gov",
    }


# ── User Saved Opportunities ─────────────────────────────────────────

@router.get("/user/saved")
async def get_user_saved(
    status: Optional[str] = None,
    user=Depends(get_user),
):
    """Get user's saved/tracked opportunities."""
    saved = get_saved_opportunities(user["id"], status=status)
    return {"saved_opportunities": saved, "total": len(saved)}


@router.post("/user/save")
async def save_user_opportunity(
    request: OpportunitySaveRequest,
    user=Depends(get_user),
):
    """Save an opportunity to user's list."""
    result = save_opportunity(
        user_id=user["id"],
        opportunity_id=request.opportunity_id,
        status=request.status,
    )
    track_interaction(user["id"], request.opportunity_id, "save")
    return {"saved": True, "data": result}


@router.put("/user/save/{opportunity_id}")
async def update_user_saved(
    opportunity_id: str,
    request: OpportunityUpdateRequest,
    user=Depends(get_user),
):
    """Update saved opportunity status/notes."""
    updates = {}
    if request.status is not None:
        updates["status"] = request.status
    if request.notes is not None:
        updates["notes"] = request.notes
    if request.priority is not None:
        updates["priority"] = request.priority
    if request.tags is not None:
        updates["tags"] = request.tags

    result = update_saved_opportunity(user["id"], opportunity_id, updates)
    return {"updated": True, "data": result}


@router.delete("/user/save/{opportunity_id}")
async def unsave_user_opportunity(
    opportunity_id: str,
    user=Depends(get_user),
):
    """Remove opportunity from user's saved list."""
    delete_saved_opportunity(user["id"], opportunity_id)
    return {"removed": True, "opportunity_id": opportunity_id}


# ── Match Scoring ─────────────────────────────────────────────────────

@router.get("/{opportunity_id}/match-score")
async def get_match_score(
    opportunity_id: str,
    user=Depends(get_user),
):
    """Calculate AI match score for opportunity vs user profile."""
    opp = get_opportunity(opportunity_id)
    if not opp:
        raise HTTPException(status_code=404, detail="Opportunity not found")

    company = get_company(user["id"])
    if not company:
        return {
            "match_score": 0,
            "message": "Complete your company profile to get match scores.",
        }

    # Check for cached analysis
    existing = get_ai_analyses(opportunity_id, user["id"], "match_score")
    if existing:
        return existing[0].get("result", {})

    from agents import get_agent
    analyst = get_agent("opportunity")

    user_profile = {
        "company_name": company.get("company_name", ""),
        "naics_codes": company.get("naics_codes", []),
        "certifications": ["SDVOSB"] if company.get("sdvosb_certified") else [],
        "cage_code": company.get("cage_code", ""),
    }

    result = await analyst.calculate_match_score(opp, user_profile)

    save_ai_analysis({
        "opportunity_id": opportunity_id,
        "user_id": user["id"],
        "analysis_type": "match_score",
        "ai_provider": "claude",
        "result": result,
        "match_score": result.get("total_score", 0),
    })

    track_interaction(user["id"], opportunity_id, "analyze")
    return result


@router.post("/match")
async def match_opportunities_to_profile(
    naics_codes: Optional[List[str]] = None,
    limit: int = 10,
    user=Depends(get_user),
):
    """Find opportunities that match user's profile."""
    company = get_company(user["id"])

    codes = naics_codes or (company.get("naics_codes", []) if company else [])
    if not codes:
        return {
            "matches": [],
            "message": "Set NAICS codes in your profile to get opportunity matches.",
        }

    all_matches = []
    for code in codes[:5]:
        opps = search_opportunities({"naics_code": code, "status": "active"}, limit=limit)
        all_matches.extend(opps)

    # Deduplicate
    seen = set()
    unique = []
    for opp in all_matches:
        if opp["id"] not in seen:
            seen.add(opp["id"])
            unique.append(opp)

    return {
        "matches": unique[:limit],
        "total": len(unique),
        "naics_codes_searched": codes,
    }

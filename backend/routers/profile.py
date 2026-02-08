"""
User Profile & Company Management Router.
"""
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import List, Optional
from services.auth import get_user
from services.db import (
    get_user_profile,
    update_user_profile,
    get_company,
    upsert_company,
    supabase,
)

router = APIRouter(prefix="/api/profile", tags=["profile"])


class ProfileUpdateRequest(BaseModel):
    full_name: Optional[str] = None
    company_name: Optional[str] = None
    phone: Optional[str] = None
    avatar_url: Optional[str] = None


class CompanyUpdateRequest(BaseModel):
    company_name: str
    duns_number: Optional[str] = None
    cage_code: Optional[str] = None
    uei: Optional[str] = None
    sdvosb_certified: bool = False
    certification_expiry: Optional[str] = None
    naics_codes: Optional[List[str]] = []
    psc_codes: Optional[List[str]] = []
    capability_statement_url: Optional[str] = None
    website: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    zip_code: Optional[str] = None


# ── User Profile ──────────────────────────────────────────────────────

@router.get("")
async def get_profile(user=Depends(get_user)):
    """Get user profile and company info."""
    profile = get_user_profile(user["id"])
    company = get_company(user["id"])

    return {
        "profile": profile or {
            "id": user["id"],
            "email": user["email"],
            "full_name": user.get("full_name", ""),
            "subscription_plan": user.get("plan", "free"),
        },
        "company": company,
    }


@router.put("")
async def update_profile(
    request: ProfileUpdateRequest,
    user=Depends(get_user),
):
    """Update user profile."""
    updates = {}
    if request.full_name is not None:
        updates["full_name"] = request.full_name
    if request.company_name is not None:
        updates["company_name"] = request.company_name
    if request.phone is not None:
        updates["phone"] = request.phone
    if request.avatar_url is not None:
        updates["avatar_url"] = request.avatar_url

    if not updates:
        raise HTTPException(status_code=400, detail="No updates provided")

    result = update_user_profile(user["id"], updates)
    return {"updated": True, "profile": result}


# ── Company Profile ───────────────────────────────────────────────────

@router.get("/company")
async def get_company_profile(user=Depends(get_user)):
    """Get company profile."""
    company = get_company(user["id"])
    if not company:
        return {"company": None, "message": "No company profile yet. Create one to get opportunity matching."}
    return {"company": company}


@router.put("/company")
async def update_company_profile(
    request: CompanyUpdateRequest,
    user=Depends(get_user),
):
    """Create or update company profile."""
    data = request.model_dump(exclude_none=True)
    result = upsert_company(user["id"], data)
    return {"updated": True, "company": result}


# ── Profile Completeness ─────────────────────────────────────────────

@router.get("/completeness")
async def check_profile_completeness(user=Depends(get_user)):
    """Check profile completion percentage."""
    profile = get_user_profile(user["id"])
    company = get_company(user["id"])

    checks = {
        "email": bool(user.get("email")),
        "full_name": bool(profile and profile.get("full_name")),
        "company_name": bool(company and company.get("company_name")),
        "naics_codes": bool(company and company.get("naics_codes")),
        "cage_code": bool(company and company.get("cage_code")),
        "duns_or_uei": bool(company and (company.get("duns_number") or company.get("uei"))),
        "certifications": bool(company and company.get("sdvosb_certified") is not None),
        "capability_statement": bool(company and company.get("capability_statement_url")),
    }

    completed = sum(1 for v in checks.values() if v)
    total = len(checks)
    percentage = int((completed / total) * 100)

    missing = [k for k, v in checks.items() if not v]

    return {
        "percentage": percentage,
        "completed": completed,
        "total": total,
        "checks": checks,
        "missing": missing,
        "ready_to_bid": percentage >= 75,
    }


# ── Past Performance ─────────────────────────────────────────────────

@router.get("/past-performance")
async def get_past_performance(user=Depends(get_user)):
    """Get past performance records."""
    company = get_company(user["id"])
    cage = company.get("cage_code", "") if company else ""

    if cage:
        result = supabase.table("contracts_history") \
            .select("*") \
            .eq("vendor_cage", cage) \
            .order("award_date", desc=True) \
            .limit(20) \
            .execute()
        contracts = result.data or []
    else:
        contracts = []

    return {
        "contracts": contracts,
        "total": len(contracts),
    }


# ── Saved Searches ───────────────────────────────────────────────────

@router.get("/saved-searches")
async def list_saved_searches(user=Depends(get_user)):
    """Get user's saved searches."""
    from services.db import get_saved_searches
    return {"saved_searches": get_saved_searches(user["id"])}


@router.post("/saved-searches")
async def create_saved_search(
    name: str,
    filters: dict,
    alert_enabled: bool = False,
    user=Depends(get_user),
):
    """Create a saved search with optional alerts."""
    from services.db import create_saved_search
    result = create_saved_search({
        "user_id": user["id"],
        "name": name,
        "filters": filters,
        "alert_enabled": alert_enabled,
    })
    return {"created": True, "saved_search": result}

"""
Compliance Checking Router - FAR/DFARS compliance, requirement extraction, and proposal checks.
"""
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import List, Optional, Dict
from services.auth import get_user
from services.db import (
    get_opportunity,
    get_proposal,
    get_company,
    get_certifications,
    supabase,
)

router = APIRouter(prefix="/api/compliance", tags=["compliance"])


class ComplianceCheckRequest(BaseModel):
    proposal_id: str


class RequirementExtractionRequest(BaseModel):
    solicitation_text: str
    opportunity_id: Optional[str] = None


# ── Compliance Check ──────────────────────────────────────────────────

@router.post("/check")
async def run_compliance_check(
    request: ComplianceCheckRequest,
    user=Depends(get_user),
):
    """Run full compliance check on a proposal."""
    proposal = get_proposal(request.proposal_id, user_id=user["id"])
    if not proposal:
        raise HTTPException(status_code=404, detail="Proposal not found")

    opportunity = proposal.get("opportunities")

    # Get proposal sections
    sections_resp = supabase.table("proposal_sections") \
        .select("*") \
        .eq("proposal_id", request.proposal_id) \
        .execute()
    sections = sections_resp.data or []

    # Get compliance requirements
    reqs_resp = supabase.table("compliance_requirements") \
        .select("*") \
        .eq("proposal_id", request.proposal_id) \
        .execute()
    requirements = reqs_resp.data or []

    # Build proposal content for AI analysis
    proposal_content = "\n\n".join([
        f"## {s.get('section_name', 'Section')}\n{s.get('content', '')}"
        for s in sections
    ])

    # Run AI compliance check
    from agents import get_agent
    compliance_agent = get_agent("compliance")

    if proposal_content and requirements:
        analysis = await compliance_agent.check_proposal(proposal_content, requirements)
    else:
        analysis = "No proposal content or requirements found to check."

    addressed = len([r for r in requirements if r.get("status") == "addressed"])
    missing = len([r for r in requirements if r.get("status") == "missing"])
    total = len(requirements)

    structural_checks = _run_structural_checks(sections, opportunity)

    check_data = {
        "proposal_id": request.proposal_id,
        "check_type": "full",
        "status": "passed" if missing == 0 and all(c["status"] == "pass" for c in structural_checks) else "failed",
        "details": {
            "ai_analysis": analysis,
            "structural_checks": structural_checks,
            "requirements_total": total,
            "requirements_addressed": addressed,
            "requirements_missing": missing,
        },
    }
    supabase.table("compliance_checks").insert(check_data).execute()

    return {
        "proposal_id": request.proposal_id,
        "overall_status": check_data["status"],
        "requirements": {
            "total": total,
            "addressed": addressed,
            "missing": missing,
            "compliance_rate": f"{(addressed / total * 100):.0f}%" if total > 0 else "N/A",
        },
        "structural_checks": structural_checks,
        "ai_analysis": analysis,
    }


@router.post("/check/{opportunity_id}")
async def check_opportunity_compliance(
    opportunity_id: str,
    user=Depends(get_user),
):
    """Check user's compliance with an opportunity's requirements."""
    opp = get_opportunity(opportunity_id)
    if not opp:
        raise HTTPException(status_code=404, detail="Opportunity not found")

    company = get_company(user["id"])
    checks = []

    # NAICS check
    opp_naics = opp.get("naics_code", "")
    user_naics = company.get("naics_codes", []) if company else []
    checks.append({
        "requirement_type": "NAICS Code",
        "required": opp_naics,
        "status": "pass" if opp_naics in user_naics else "fail",
        "details": f"Required: {opp_naics}. Your codes: {', '.join(user_naics) if user_naics else 'None set'}",
    })

    # Set-aside check
    set_aside = opp.get("set_aside", "")
    sdvosb_certified = company.get("sdvosb_certified", False) if company else False
    if set_aside:
        is_eligible = (
            ("SDVOSB" in set_aside.upper() and sdvosb_certified) or
            not set_aside or
            set_aside.upper() == "NONE"
        )
        checks.append({
            "requirement_type": "Set-Aside Eligibility",
            "required": set_aside,
            "status": "pass" if is_eligible else "warning",
            "details": f"Set-aside: {set_aside}. SDVOSB Certified: {sdvosb_certified}",
        })

    # SAM.gov registration check
    has_uei = bool(company.get("uei")) if company else False
    checks.append({
        "requirement_type": "SAM.gov Registration",
        "required": "Active SAM.gov registration",
        "status": "pass" if has_uei else "fail",
        "details": f"UEI: {company.get('uei', 'Not set')}" if company else "No company profile",
    })

    # CAGE code check
    has_cage = bool(company.get("cage_code")) if company else False
    checks.append({
        "requirement_type": "CAGE Code",
        "required": "Valid CAGE code",
        "status": "pass" if has_cage else "warning",
        "details": f"CAGE: {company.get('cage_code', 'Not set')}" if company else "No company profile",
    })

    passed = sum(1 for c in checks if c["status"] == "pass")
    overall = "pass" if passed == len(checks) else ("warning" if passed >= len(checks) / 2 else "fail")

    return {
        "opportunity_id": opportunity_id,
        "overall_status": overall,
        "checks": checks,
        "passed": passed,
        "total": len(checks),
        "ready_to_bid": overall != "fail",
    }


# ── Requirement Extraction ────────────────────────────────────────────

@router.post("/extract-requirements")
async def extract_requirements(
    request: RequirementExtractionRequest,
    user=Depends(get_user),
):
    """Extract compliance requirements from solicitation text using AI."""
    from agents import get_agent
    compliance_agent = get_agent("compliance")
    analysis = await compliance_agent.extract_requirements(request.solicitation_text)
    return {"analysis": analysis, "opportunity_id": request.opportunity_id}


@router.get("/requirements/{opportunity_id}")
async def get_compliance_requirements(
    opportunity_id: str,
    user=Depends(get_user),
):
    """Get extracted compliance requirements for an opportunity."""
    opp = get_opportunity(opportunity_id)
    if not opp:
        raise HTTPException(status_code=404, detail="Opportunity not found")

    proposals_resp = supabase.table("proposals") \
        .select("id") \
        .eq("opportunity_id", opportunity_id) \
        .eq("user_id", user["id"]) \
        .execute()

    requirements = []
    for p in (proposals_resp.data or []):
        reqs_resp = supabase.table("compliance_requirements") \
            .select("*") \
            .eq("proposal_id", p["id"]) \
            .execute()
        requirements.extend(reqs_resp.data or [])

    return {"opportunity_id": opportunity_id, "requirements": requirements, "total": len(requirements)}


@router.get("/status")
async def get_compliance_status(user=Depends(get_user)):
    """Get overall compliance readiness status."""
    company = get_company(user["id"])
    certs = get_certifications(user["id"])
    active_certs = [c for c in certs if c.get("status") == "active"]

    return {
        "company_profile_complete": bool(company and company.get("naics_codes")),
        "sam_registered": bool(company and company.get("uei")),
        "cage_code": bool(company and company.get("cage_code")),
        "active_certifications": len(active_certs),
        "certifications": certs,
        "ready_to_bid": bool(
            company and company.get("uei") and company.get("cage_code") and company.get("naics_codes")
        ),
    }


def _run_structural_checks(sections: list, opportunity: dict) -> list:
    checks = []
    section_names = [s.get("section_name", "").lower() for s in sections]

    for section_key, section_label in [
        ("executive summary", "Executive Summary section"),
        ("technical approach", "Technical Approach section"),
    ]:
        found = any(section_key in name for name in section_names)
        checks.append({
            "check": section_label,
            "status": "pass" if found else "warning",
            "details": f"{'Found' if found else 'Missing'}: {section_label}",
        })

    total_words = sum(len(s.get("content", "").split()) for s in sections)
    checks.append({
        "check": "Content Volume",
        "status": "pass" if total_words > 200 else "warning",
        "details": f"Total word count: {total_words}",
    })

    return checks

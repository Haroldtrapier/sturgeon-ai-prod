"""
Proposal Management API

End-to-end workflow:
1. POST /create - Extract requirements from RFP
2. POST /{id}/generate - Generate proposal sections
3. GET /{id} - View proposal + compliance matrix
4. PUT /{id}/sections/{section_id} - Edit sections
5. GET /{id}/export - Export to DOCX/PDF (Phase 4.5)
"""

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from backend.services.auth import get_user
from backend.services.db import supabase
from backend.services.compliance_extractor import extract_requirements
from backend.services.proposal_generator import generate_section

router = APIRouter(prefix="/proposals", tags=["proposals"])


class CreateProposalRequest(BaseModel):
    opportunity_id: str
    rfp_text: str
    title: str = "New Proposal"


class GenerateSectionRequest(BaseModel):
    section_name: str
    company_profile: dict = None


@router.post("/create")
def create_proposal(request: CreateProposalRequest, user=Depends(get_user)):
    """
    Create a new proposal and extract compliance requirements from RFP text.
    
    This is the entry point for the proposal workflow:
    1. Creates proposal record
    2. Extracts SHALL/MUST requirements from RFP
    3. Populates compliance matrix
    4. Returns proposal_id and requirement count
    """
    
    # Validate opportunity exists and belongs to user
    opp_response = supabase.table("opportunities") \
        .select("*") \
        .eq("id", request.opportunity_id) \
        .eq("user_id", user.id) \
        .execute()
    
    if not opp_response.data:
        raise HTTPException(status_code=404, detail="Opportunity not found")
    
    # Create proposal
    proposal_response = supabase.table("proposals").insert({
        "user_id": user.id,
        "opportunity_id": request.opportunity_id,
        "title": request.title,
        "status": "draft"
    }).execute()
    
    if not proposal_response.data:
        raise HTTPException(status_code=500, detail="Failed to create proposal")
    
    proposal = proposal_response.data[0]
    
    # Extract requirements from RFP
    requirements = extract_requirements(request.rfp_text)
    
    # Insert requirements into compliance matrix
    if requirements:
        requirement_records = [
            {
                "proposal_id": proposal["id"],
                "requirement": req["requirement"],
                "section_ref": req.get("section_ref", ""),
                "status": "missing"
            }
            for req in requirements
        ]
        
        supabase.table("compliance_requirements").insert(requirement_records).execute()
    
    return {
        "proposal_id": proposal["id"],
        "title": proposal["title"],
        "requirements_extracted": len(requirements),
        "status": "draft"
    }


@router.post("/{proposal_id}/generate")
def generate_proposal_section(
    proposal_id: str,
    request: GenerateSectionRequest,
    user=Depends(get_user)
):
    """
    Generate a proposal section using AI.
    
    Workflow:
    1. Fetch proposal and linked opportunity
    2. Get relevant compliance requirements
    3. Generate section content using LLM
    4. Save to proposal_sections
    5. Mark requirements as 'addressed'
    """
    
    # Validate proposal belongs to user
    proposal_response = supabase.table("proposals") \
        .select("*, opportunities(*)") \
        .eq("id", proposal_id) \
        .eq("user_id", user.id) \
        .execute()
    
    if not proposal_response.data:
        raise HTTPException(status_code=404, detail="Proposal not found")
    
    proposal = proposal_response.data[0]
    opportunity = proposal.get("opportunities")
    
    if not opportunity:
        raise HTTPException(status_code=400, detail="No opportunity linked to proposal")
    
    # Get compliance requirements
    reqs_response = supabase.table("compliance_requirements") \
        .select("*") \
        .eq("proposal_id", proposal_id) \
        .execute()
    
    requirements = reqs_response.data or []
    
    # Generate section content
    content = generate_section(
        section_name=request.section_name,
        requirements=requirements,
        opportunity=opportunity,
        company_profile=request.company_profile
    )
    
    # Save section
    section_response = supabase.table("proposal_sections").insert({
        "proposal_id": proposal_id,
        "section_name": request.section_name,
        "content": content
    }).execute()
    
    if not section_response.data:
        raise HTTPException(status_code=500, detail="Failed to save section")
    
    # Update requirements status to 'addressed'
    # (In production, should be smarter about which requirements are actually addressed)
    if requirements:
        supabase.table("compliance_requirements") \
            .update({"status": "addressed"}) \
            .eq("proposal_id", proposal_id) \
            .execute()
    
    # Update proposal status
    supabase.table("proposals") \
        .update({"status": "in_progress"}) \
        .eq("id", proposal_id) \
        .execute()
    
    return {
        "section_id": section_response.data[0]["id"],
        "section_name": request.section_name,
        "content_length": len(content),
        "status": "generated"
    }


@router.get("/{proposal_id}")
def get_proposal(proposal_id: str, user=Depends(get_user)):
    """
    Get complete proposal with sections and compliance matrix.
    """
    
    # Get proposal
    proposal_response = supabase.table("proposals") \
        .select("*, opportunities(*)") \
        .eq("id", proposal_id) \
        .eq("user_id", user.id) \
        .execute()
    
    if not proposal_response.data:
        raise HTTPException(status_code=404, detail="Proposal not found")
    
    proposal = proposal_response.data[0]
    
    # Get sections
    sections_response = supabase.table("proposal_sections") \
        .select("*") \
        .eq("proposal_id", proposal_id) \
        .order("created_at") \
        .execute()
    
    # Get compliance requirements
    requirements_response = supabase.table("compliance_requirements") \
        .select("*") \
        .eq("proposal_id", proposal_id) \
        .order("section_ref") \
        .execute()
    
    return {
        "proposal": proposal,
        "sections": sections_response.data or [],
        "compliance_matrix": requirements_response.data or [],
        "stats": {
            "total_requirements": len(requirements_response.data or []),
            "addressed": len([r for r in (requirements_response.data or []) if r["status"] == "addressed"]),
            "missing": len([r for r in (requirements_response.data or []) if r["status"] == "missing"]),
            "sections_count": len(sections_response.data or [])
        }
    }


@router.get("/")
def list_proposals(user=Depends(get_user)):
    """
    List all proposals for authenticated user.
    """
    
    response = supabase.table("proposals") \
        .select("*, opportunities(title, agency)") \
        .eq("user_id", user.id) \
        .order("created_at", desc=True) \
        .execute()
    
    return {
        "proposals": response.data or []
    }
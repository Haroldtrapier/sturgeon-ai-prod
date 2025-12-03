"""
Proposals router
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from backend.database import get_db
from backend.models import Proposal, CompanyProfile
from backend.services.proposal_generator import generate_proposal

router = APIRouter(prefix="/proposals", tags=["proposals"])


@router.post("/{proposal_id}/generate")
async def generate_proposal_text(proposal_id: str, db: Session = Depends(get_db)):
    """
    Generate proposal text for a given proposal ID.
    
    Args:
        proposal_id: The ID of the proposal to generate text for
        db: Database session
        
    Returns:
        Generated proposal text
    """
    # Query the proposal from the database
    proposal = db.query(Proposal).filter(Proposal.id == proposal_id).first()
    
    if not proposal:
        raise HTTPException(status_code=404, detail=f"Proposal with id {proposal_id} not found")
    
    # Load company profile from database
    # For now, get the first company profile or use default
    company_profile_obj = db.query(CompanyProfile).first()
    
    if company_profile_obj:
        # Convert company profile to string representation
        profile = {
            "name": company_profile_obj.name,
            "description": company_profile_obj.description,
            "industry": company_profile_obj.industry,
            "capabilities": company_profile_obj.capabilities,
            "past_performance": company_profile_obj.past_performance,
            "certifications": company_profile_obj.certifications,
        }
    else:
        # Fallback to default profile if no profile exists in database
        profile = {"name": "Trapier Management LLC"}  # TODO: load real profile

    # Generate the proposal text
    content = await generate_proposal(
        raw_requirements=proposal.raw_text or "",
        company_profile=str(profile)
    )
    
    return {"generated": content}

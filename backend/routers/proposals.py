"""
Proposals router
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from services.proposal_ai import generate_full_proposal
from models.proposal import Proposal
from database import get_db

router = APIRouter(prefix="/api/proposals", tags=["proposals"])

# Default company profile - TODO: load from database or environment variable
DEFAULT_COMPANY_PROFILE = "Trapier Management LLC – SDVOSB, logistics & AI solutions."


@router.post("/{proposal_id}/generate-full")
async def generate_full_proposal_endpoint(proposal_id: str, db: Session = Depends(get_db)):
    """
    Generate a full proposal for a given proposal ID.
    
    Args:
        proposal_id: The ID of the proposal
        db: Database session
        
    Returns:
        Generated proposal result with draft and metadata
    """
    proposal = db.query(Proposal).filter(Proposal.id == proposal_id).first()
    if not proposal:
        raise HTTPException(status_code=404, detail="Proposal not found")

    # TODO: load real company profile from DB
    company_profile = DEFAULT_COMPANY_PROFILE

    result = await generate_full_proposal(
        raw_requirements=proposal.raw_text or "",
        company_profile=company_profile,
    )
    
    # Store result in proposal.generated_text if available
    if result.get("draft"):
        proposal.generated_text = result["draft"]
        db.commit()
        db.refresh(proposal)
    
    return result

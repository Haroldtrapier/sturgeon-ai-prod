from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db

from models.proposal import Proposal
import services.proposal_ai as a_ai
from services.proposal_ai import generate_full_proposal, write_proposal

router = APIRouter(prefix="/proposals", tags=["Proposals"])

@router.get("/")
async def list_proposals(db: Session = Depends(get_db)):
    """List all proposals for the current user."""
    proposals = db.query(Proposal).all()
    return {"proposals": [{
        "id": p.id,
        "name": p.name,
        "user_id": p.user_id,
        "created_at": p.created_at.isoformat(),
        "updated_at": p.updated_at.isoformat(),
    } for p in proposals]}

@router.post("/")
async def create_proposal(db: Session = Depends(get_db)):
    """Create a new proposal shell."""
    p = Proposal(
        id=None, # let DB set ID
        name="New Proposal",
        user_id=None,
        raw_text="",
        generated_text="",
    )
    db.add(p)
    db.commit()
    return {"id": p.id}


@router.get("/{proposal_id}")
async def get_proposal(proposal_id: str, db: Session = Depends(get_db)):
    """Get proposal details by ID."""
    p = db.query(Proposal).filter(Proposal.id == proposal_id).first()
    if not p:
        raise HTTPException(status_code=404, detail="Proposal not found")
    return {
        "id": p.id,
        "name": p.name,
        "user_id": p.user_id,
        "raw_text": p.raw_text,
        "generated_text": p.generated_text,
        "created_at": p.created_at.isoformat(),
        "updated_at": p.updated_at.isoformat(),
    }

@router.post("/{proposal_id}/generate")
async def generate_proposal_text(proposal_id: str, db: Session = Depends(get_db)):
    """Generate a one-pass AI proposal draft."""
    p = db.query(Proposal).filter(Proposal.id == proposal_id).first()
    if not p:
        raise HTTPException(status_code=404, detail="Proposal not found")

    company_profile = "Trapier Management LLC — SDVOSB, logistics & AI solutions."

    draft = await write_proposal(
        outline="High-level outline based on requirements and company profile.",
        company_profile=company_profile,
    )

    p.generated_text = draft
    db.commit()

    return {"generated": draft}

@router.post("/{proposal_id}/generate-full")
async def generate_full_proposal_endpoint(proposal_id: str, db: Session = Depends(get_db)):
    """Run full 3-stage pipeline: analyzer —  outliner —  positional writer."""
    p = db.query(Proposal).filter(Proposal.id == proposal_id).first()
    if not p:
        raise HTTPException(status_code=404, detail="Proposal not found")

    company_profile = "Trapier Management LLC — SDVOSB, logistics & AI solutions."

    result = await generate_full_proposal(
        raw_requirements=p.raw_text or "",
        company_profile=company_profile,
    )

    # Store o“draft” back onto the Proposal model
    p.generated_text = result["draft"]
    db.commit()

    return result
@router.put("/{proposal_id}")
async def update_proposal(proposal_id: str, db: Session = Depends(get_db)):
    """Update proposal details."""
    p = db.query(Proposal).filter(Proposal.id == proposal_id).first()
    if not p:
        raise HTTPException(status_code=404, detail="Proposal not found")
    # TODO: Apply patches from body to update model
    db.commit()
    return {"message": "Proposal updated"}

@router.delete("/{proposal_id}")
async def delete_proposal(proposal_id: str, db: Session = Depends(get_db)):
    """Delete a proposal."""
    p = db.query(Proposal).filter(Proposal.id == proposal_id).first()
    if not p:
        raise HTTPException(status_code=404, detail="Proposal not found")
    db.delete(p)
    db.commit()
    return {"message": "Proposal deleted"}

"""
Proposals router - API endpoints for managing proposals
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

# Import using absolute imports (works when backend is run from backend directory)
try:
    from database import get_db
    from models import User, Proposal
    from schemas import ProposalUpdate, ProposalOut
    from dependencies import get_current_user
except ImportError:
    # Fallback for when running as a package
    from ..database import get_db
    from ..models import User, Proposal
    from ..schemas import ProposalUpdate, ProposalOut
    from ..dependencies import get_current_user

router = APIRouter(prefix="/proposals", tags=["proposals"])


@router.put("/{proposal_id}", response_model=ProposalOut)
def update_proposal(
    proposal_id: int,
    payload: ProposalUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Update a proposal by ID.
    Only the owner of the proposal can update it.
    """
    proposal = (
        db.query(Proposal)
        .filter(Proposal.id == proposal_id, Proposal.user_id == current_user.id)
        .one_or_none()
    )
    if proposal is None:
        raise HTTPException(status_code=404, detail="Proposal not found")

    # Apply updates from payload
    if payload.title is not None:
        proposal.title = payload.title
    if payload.body is not None:
        proposal.body = payload.body
    if payload.status is not None:
        proposal.status = payload.status

    db.commit()
    db.refresh(proposal)
    return proposal

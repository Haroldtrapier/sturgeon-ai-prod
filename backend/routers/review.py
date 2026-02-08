from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Optional
from datetime import datetime

router = APIRouter(prefix="/reviews")

try:
    from services.db import supabase
    from services.auth import get_user
except ImportError:
    try:
        from backend.services.db import supabase
        from backend.services.auth import get_user
    except ImportError:
        supabase = None
        def get_user():
            return None


class ReviewRequest(BaseModel):
    proposal_id: str
    notes: Optional[str] = None


class ReviewUpdate(BaseModel):
    status: str
    reviewer_notes: Optional[str] = None
    score: Optional[int] = None


@router.post("/request")
def request_review(request: ReviewRequest, user=Depends(get_user)):
    """Request a human review of a proposal."""
    if not supabase:
        return {"status": "requested", "message": "Review service not configured."}

    try:
        prop_res = supabase.table("proposals").select("id, title").eq("id", request.proposal_id).eq("user_id", user["id"]).execute()
        if not prop_res.data:
            raise HTTPException(status_code=404, detail="Proposal not found")
    except HTTPException:
        raise
    except Exception:
        pass

    review_record = {
        "proposal_id": request.proposal_id,
        "user_id": user["id"],
        "reviewer_email": "reviewer@sturgeonai.com",
        "status": "pending",
        "notes": request.notes,
        "requested_at": datetime.utcnow().isoformat(),
    }

    try:
        supabase.table("proposal_reviews").insert(review_record).execute()
    except Exception:
        pass

    return {
        "status": "requested",
        "proposal_id": request.proposal_id,
        "message": "Human review requested. A reviewer will contact you within 48 hours.",
    }


@router.get("/")
def list_reviews(user=Depends(get_user)):
    """List all review requests for the user."""
    if not supabase:
        return {"reviews": []}
    try:
        res = supabase.table("proposal_reviews").select("*, proposals(title)").eq("user_id", user["id"]).order("requested_at", desc=True).execute()
        return {"reviews": res.data or []}
    except Exception:
        return {"reviews": []}


@router.get("/{review_id}")
def get_review(review_id: str, user=Depends(get_user)):
    """Get review details."""
    if not supabase:
        raise HTTPException(status_code=404, detail="Review not found")
    try:
        res = supabase.table("proposal_reviews").select("*, proposals(title, status)").eq("id", review_id).eq("user_id", user["id"]).execute()
        if not res.data:
            raise HTTPException(status_code=404, detail="Review not found")
        return res.data[0]
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(status_code=500, detail="Error fetching review")


@router.put("/{review_id}")
def update_review(review_id: str, update: ReviewUpdate, user=Depends(get_user)):
    """Update review status."""
    if not supabase:
        return {"updated": False}
    try:
        update_data = {"status": update.status, "updated_at": datetime.utcnow().isoformat()}
        if update.reviewer_notes:
            update_data["reviewer_notes"] = update.reviewer_notes
        if update.score is not None:
            update_data["score"] = update.score
        supabase.table("proposal_reviews").update(update_data).eq("id", review_id).execute()
        return {"updated": True, "review_id": review_id, "status": update.status}
    except Exception:
        return {"updated": False}

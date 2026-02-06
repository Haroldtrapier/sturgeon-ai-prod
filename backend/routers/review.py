from fastapi import APIRouter, Depends
from backend.services.db import supabase
from backend.services.auth import get_user

router = APIRouter(prefix="/reviews")

@router.post("/request")
def request_review(proposal_id: str, user=Depends(get_user)):
    supabase.table("proposal_reviews").insert({
        "proposal_id": proposal_id,
        "reviewer_email": "reviewer@sturgeonai.com"
    }).execute()
    return {"status": "requested"}

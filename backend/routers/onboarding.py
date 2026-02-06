"""
Onboarding API

Handles user onboarding workflow:
1. Profile setup (NAICS, keywords)
2. First alert creation
3. First opportunity match
"""

from fastapi import APIRouter, Depends
from pydantic import BaseModel
from backend.services.auth import get_user
from backend.services.db import supabase

router = APIRouter(prefix="/onboarding", tags=["onboarding"])


class ProfileRequest(BaseModel):
    naics: list[str]
    keywords: list[str]


@router.post("/profile")
def create_profile(request: ProfileRequest, user=Depends(get_user)):
    """
    Create or update user profile during onboarding.
    """
    
    # Upsert profile
    supabase.table("user_profiles").upsert({
        "user_id": user.id,
        "naics": request.naics,
        "keywords": request.keywords,
        "onboarding_completed": False
    }).execute()
    
    return {
        "status": "profile_saved",
        "naics": request.naics,
        "keywords": request.keywords
    }


@router.post("/complete")
def complete_onboarding(user=Depends(get_user)):
    """
    Mark onboarding as complete.
    """
    
    supabase.table("user_profiles").update({
        "onboarding_completed": True
    }).eq("user_id", user.id).execute()
    
    return {"status": "onboarding_complete"}


@router.get("/status")
def get_onboarding_status(user=Depends(get_user)):
    """
    Check if user has completed onboarding.
    """
    
    response = supabase.table("user_profiles") \
        .select("*") \
        .eq("user_id", user.id) \
        .execute()
    
    if not response.data:
        return {
            "onboarding_completed": False,
            "profile_exists": False
        }
    
    profile = response.data[0]
    
    return {
        "onboarding_completed": profile.get("onboarding_completed", False),
        "profile_exists": True,
        "naics": profile.get("naics", []),
        "keywords": profile.get("keywords", [])
    }

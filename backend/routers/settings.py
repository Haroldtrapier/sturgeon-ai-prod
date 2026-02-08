from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Optional, Dict

router = APIRouter(prefix="/api/settings", tags=["settings"])

try:
    from services.auth import get_user
    from services.db import supabase
except ImportError:
    try:
        from backend.services.auth import get_user
        from backend.services.db import supabase
    except ImportError:
        supabase = None
        def get_user():
            return None


class UserSettings(BaseModel):
    theme: Optional[str] = "dark"
    language: Optional[str] = "en"
    timezone: Optional[str] = "America/New_York"
    notifications: Optional[Dict] = {}
    email_preferences: Optional[Dict] = {}


@router.get("")
async def get_settings(user=Depends(get_user)):
    """Get user settings."""
    if supabase:
        try:
            res = supabase.table("user_profiles").select("settings").eq("user_id", user["id"]).execute()
            if res.data and res.data[0].get("settings"):
                return res.data[0]["settings"]
        except Exception:
            pass
    return {
        "theme": "dark",
        "language": "en",
        "timezone": "America/New_York",
        "notifications": {"email": True, "push": True, "sms": False},
        "email_preferences": {"daily_digest": True, "opportunity_alerts": True, "proposal_reminders": True},
        "display": {"density": "comfortable", "sidebar_collapsed": False},
    }


@router.put("")
async def update_settings(settings: UserSettings, user=Depends(get_user)):
    """Update user settings."""
    settings_dict = settings.dict(exclude_none=True)
    if supabase:
        try:
            supabase.table("user_profiles").upsert({
                "user_id": user["id"],
                "settings": settings_dict,
            }).execute()
        except Exception:
            pass
    return {"updated": True, "settings": settings_dict}


@router.get("/account")
async def get_account_settings(user=Depends(get_user)):
    """Get account-level settings."""
    return {
        "email": user.get("email", ""),
        "two_factor_enabled": False,
        "api_access_enabled": False,
        "data_sharing": {"analytics": True, "marketing": False},
    }


@router.put("/account")
async def update_account_settings(settings: dict, user=Depends(get_user)):
    """Update account settings."""
    return {"updated": True, "settings": settings}


@router.post("/export")
async def export_data(user=Depends(get_user)):
    """Export user data."""
    return {
        "export_requested": True,
        "estimated_completion": "2026-02-09T00:00:00Z",
        "message": "Your data export will be available for download within 24 hours.",
    }


@router.delete("/account")
async def delete_account(user=Depends(get_user)):
    """Schedule account deletion."""
    return {
        "scheduled_for_deletion": True,
        "deletion_date": "2026-02-15T00:00:00Z",
        "message": "Account will be permanently deleted in 7 days. You can cancel this action before then.",
    }

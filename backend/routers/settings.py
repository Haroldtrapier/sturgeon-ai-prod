from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, Dict

router = APIRouter(prefix="/api/settings", tags=["settings"])

class UserSettings(BaseModel):
    theme: Optional[str] = "light"
    language: Optional[str] = "en"
    timezone: Optional[str] = "America/New_York"
    notifications: Optional[Dict] = {}
    email_preferences: Optional[Dict] = {}

@router.get("")
async def get_settings(user_id: Optional[str] = None):
    """Get user settings"""
    return {
        "theme": "light",
        "language": "en",
        "timezone": "America/New_York",
        "notifications": {
            "email": True,
            "push": True,
            "sms": False
        },
        "email_preferences": {
            "daily_digest": True,
            "opportunity_alerts": True,
            "proposal_reminders": True
        },
        "display": {
            "density": "comfortable",
            "sidebar_collapsed": False
        }
    }

@router.put("")
async def update_settings(settings: UserSettings):
    """Update user settings"""
    return {
        "updated": True,
        "settings": settings
    }

@router.get("/account")
async def get_account_settings(user_id: Optional[str] = None):
    """Get account-level settings"""
    return {
        "email": "user@example.com",
        "two_factor_enabled": False,
        "api_access_enabled": False,
        "data_sharing": {
            "analytics": True,
            "marketing": False
        }
    }

@router.put("/account")
async def update_account_settings(settings: dict):
    """Update account settings"""
    return {
        "updated": True,
        "settings": settings
    }

@router.post("/export")
async def export_data(user_id: Optional[str] = None):
    """Export user data"""
    return {
        "export_requested": True,
        "estimated_completion": "2026-02-04T00:00:00Z",
        "message": "Your data export will be available for download within 24 hours"
    }

@router.delete("/account")
async def delete_account(user_id: Optional[str] = None):
    """Delete user account"""
    return {
        "scheduled_for_deletion": True,
        "deletion_date": "2026-02-10T00:00:00Z",
        "message": "Account will be permanently deleted in 7 days. You can cancel this action before then."
    }

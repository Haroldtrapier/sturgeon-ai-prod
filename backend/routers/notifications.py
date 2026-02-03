from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

router = APIRouter(prefix="/api/notifications", tags=["notifications"])

class Notification(BaseModel):
    id: str
    type: str
    title: str
    message: str
    read: bool = False
    created_at: datetime
    data: Optional[dict] = None

@router.get("")
async def list_notifications(
    user_id: Optional[str] = None,
    unread_only: bool = False,
    limit: int = 20
):
    """List user notifications"""
    return {
        "notifications": [
            {
                "id": "notif_1",
                "type": "opportunity",
                "title": "New Opportunity Match",
                "message": "3 new opportunities match your profile",
                "read": False,
                "created_at": datetime.now().isoformat(),
                "data": {"opportunity_count": 3}
            },
            {
                "id": "notif_2",
                "type": "deadline",
                "title": "Upcoming Deadline",
                "message": "Proposal due in 3 days",
                "read": False,
                "created_at": datetime.now().isoformat(),
                "data": {"opportunity_id": "opp_123", "days_remaining": 3}
            }
        ],
        "unread_count": 2,
        "total": 2
    }

@router.put("/{notification_id}/read")
async def mark_as_read(notification_id: str):
    """Mark notification as read"""
    return {
        "notification_id": notification_id,
        "read": True
    }

@router.put("/read-all")
async def mark_all_as_read(user_id: Optional[str] = None):
    """Mark all notifications as read"""
    return {
        "marked_read": True,
        "count": 0
    }

@router.delete("/{notification_id}")
async def delete_notification(notification_id: str):
    """Delete a notification"""
    return {
        "deleted": True,
        "notification_id": notification_id
    }

@router.get("/preferences")
async def get_notification_preferences(user_id: Optional[str] = None):
    """Get notification preferences"""
    return {
        "email_notifications": True,
        "push_notifications": True,
        "notification_types": {
            "new_opportunities": True,
            "deadlines": True,
            "proposal_updates": True,
            "system_alerts": True
        }
    }

@router.put("/preferences")
async def update_notification_preferences(preferences: dict):
    """Update notification preferences"""
    return {
        "updated": True,
        "preferences": preferences
    }

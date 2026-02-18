"""
Notifications Router - User notification management.
"""
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Optional, Dict
from services.auth import get_user
from services.db import (
    get_notifications,
    create_notification,
    mark_notification_read,
    mark_all_notifications_read,
    get_unread_notification_count,
    supabase,
)

router = APIRouter(prefix="/api/notifications", tags=["notifications"])


class NotificationPreferencesRequest(BaseModel):
    email_notifications: Optional[bool] = None
    push_notifications: Optional[bool] = None
    notification_types: Optional[Dict[str, bool]] = None


@router.get("")
async def list_notifications(
    unread_only: bool = False,
    limit: int = 50,
    user=Depends(get_user),
):
    """List user notifications."""
    notifications = get_notifications(user["id"], unread_only=unread_only, limit=limit)
    unread_count = get_unread_notification_count(user["id"])

    return {
        "notifications": notifications,
        "unread_count": unread_count,
        "total": len(notifications),
    }


@router.get("/unread-count")
async def get_unread_count(user=Depends(get_user)):
    """Get count of unread notifications."""
    count = get_unread_notification_count(user["id"])
    return {"unread_count": count}


@router.put("/{notification_id}/read")
async def mark_as_read(notification_id: str, user=Depends(get_user)):
    """Mark a notification as read."""
    mark_notification_read(notification_id)
    return {"notification_id": notification_id, "read": True}


@router.put("/read-all")
async def mark_all_read(user=Depends(get_user)):
    """Mark all notifications as read."""
    mark_all_notifications_read(user["id"])
    return {"marked_read": True}


@router.delete("/{notification_id}")
async def delete_notification(notification_id: str, user=Depends(get_user)):
    """Delete a notification."""
    supabase.table("notifications") \
        .delete() \
        .eq("id", notification_id) \
        .eq("user_id", user["id"]) \
        .execute()
    return {"deleted": True, "notification_id": notification_id}


@router.get("/preferences")
async def get_notification_preferences(user=Depends(get_user)):
    """Get notification preferences."""
    # Preferences stored in user_preferences or a settings table
    return {
        "email_notifications": True,
        "push_notifications": True,
        "notification_types": {
            "new_opportunities": True,
            "deadlines": True,
            "proposal_updates": True,
            "system_alerts": True,
            "ai_insights": True,
        },
    }


@router.put("/preferences")
async def update_notification_preferences(
    request: NotificationPreferencesRequest,
    user=Depends(get_user),
):
    """Update notification preferences."""
    return {"updated": True, "preferences": request.model_dump(exclude_none=True)}

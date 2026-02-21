"""
Call campaigns router - bulk calling with contact management.
Supports creating call campaigns, tracking call outcomes, and managing call queues.
"""
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

from services.db import supabase
from services.auth import get_user

router = APIRouter(prefix="/calls", tags=["Calls"])


class CampaignCreate(BaseModel):
    name: str
    description: Optional[str] = None
    script: Optional[str] = None
    contact_ids: List[str]


class CampaignUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    script: Optional[str] = None
    status: Optional[str] = None


class CallLogCreate(BaseModel):
    campaign_id: str
    contact_id: str
    outcome: str  # connected, voicemail, no_answer, busy, wrong_number, callback, not_interested, interested, closed
    duration_seconds: Optional[int] = None
    notes: Optional[str] = None
    callback_at: Optional[str] = None


class CallLogUpdate(BaseModel):
    outcome: Optional[str] = None
    duration_seconds: Optional[int] = None
    notes: Optional[str] = None
    callback_at: Optional[str] = None


# ── Campaigns ────────────────────────────────────────────────────────


@router.get("/campaigns")
def list_campaigns(user=Depends(get_user)):
    """List all call campaigns for the user."""
    result = (
        supabase.table("call_campaigns")
        .select("*")
        .eq("user_id", user["id"])
        .order("created_at", desc=True)
        .execute()
    )
    campaigns = result.data or []

    for campaign in campaigns:
        logs = (
            supabase.table("call_logs")
            .select("outcome")
            .eq("campaign_id", campaign["id"])
            .execute()
        )
        log_data = logs.data or []
        campaign["total_calls"] = len(log_data)
        campaign["completed_calls"] = len([l for l in log_data if l["outcome"] != "pending"])
        campaign["connected_calls"] = len([l for l in log_data if l["outcome"] in ("connected", "interested", "closed", "callback")])

    return {"campaigns": campaigns}


@router.post("/campaigns")
def create_campaign(payload: CampaignCreate, user=Depends(get_user)):
    """Create a new call campaign and queue contacts for calling."""
    if not payload.contact_ids:
        raise HTTPException(status_code=400, detail="At least one contact is required")

    contacts = (
        supabase.table("contacts")
        .select("id, first_name, last_name, phone, company")
        .eq("user_id", user["id"])
        .in_("id", payload.contact_ids)
        .execute()
    )
    valid_contacts = contacts.data or []
    if not valid_contacts:
        raise HTTPException(status_code=400, detail="No valid contacts found")

    campaign_data = {
        "user_id": user["id"],
        "name": payload.name,
        "description": payload.description or "",
        "script": payload.script or "",
        "status": "active",
        "total_contacts": len(valid_contacts),
    }
    result = supabase.table("call_campaigns").insert(campaign_data).execute()
    if not result.data:
        raise HTTPException(status_code=500, detail="Failed to create campaign")

    campaign = result.data[0]

    call_logs = [
        {
            "campaign_id": campaign["id"],
            "user_id": user["id"],
            "contact_id": c["id"],
            "outcome": "pending",
        }
        for c in valid_contacts
    ]
    supabase.table("call_logs").insert(call_logs).execute()

    return {
        "campaign": campaign,
        "queued_contacts": len(valid_contacts),
        "message": f"Campaign created with {len(valid_contacts)} contacts queued",
    }


@router.get("/campaigns/{campaign_id}")
def get_campaign(campaign_id: str, user=Depends(get_user)):
    """Get campaign details with call queue and stats."""
    result = (
        supabase.table("call_campaigns")
        .select("*")
        .eq("id", campaign_id)
        .eq("user_id", user["id"])
        .single()
        .execute()
    )
    if not result.data:
        raise HTTPException(status_code=404, detail="Campaign not found")

    campaign = result.data

    logs = (
        supabase.table("call_logs")
        .select("*, contacts(id, first_name, last_name, phone, email, company, title, agency)")
        .eq("campaign_id", campaign_id)
        .order("created_at", desc=False)
        .execute()
    )
    call_logs = logs.data or []

    stats = {
        "total": len(call_logs),
        "pending": len([l for l in call_logs if l["outcome"] == "pending"]),
        "connected": len([l for l in call_logs if l["outcome"] == "connected"]),
        "voicemail": len([l for l in call_logs if l["outcome"] == "voicemail"]),
        "no_answer": len([l for l in call_logs if l["outcome"] == "no_answer"]),
        "busy": len([l for l in call_logs if l["outcome"] == "busy"]),
        "wrong_number": len([l for l in call_logs if l["outcome"] == "wrong_number"]),
        "callback": len([l for l in call_logs if l["outcome"] == "callback"]),
        "interested": len([l for l in call_logs if l["outcome"] == "interested"]),
        "not_interested": len([l for l in call_logs if l["outcome"] == "not_interested"]),
        "closed": len([l for l in call_logs if l["outcome"] == "closed"]),
    }

    return {"campaign": campaign, "call_logs": call_logs, "stats": stats}


@router.patch("/campaigns/{campaign_id}")
def update_campaign(campaign_id: str, payload: CampaignUpdate, user=Depends(get_user)):
    """Update a campaign."""
    data = payload.model_dump(exclude_none=True)
    if not data:
        raise HTTPException(status_code=400, detail="No fields to update")

    result = (
        supabase.table("call_campaigns")
        .update(data)
        .eq("id", campaign_id)
        .eq("user_id", user["id"])
        .execute()
    )
    if not result.data:
        raise HTTPException(status_code=404, detail="Campaign not found")
    return {"campaign": result.data[0], "message": "Campaign updated"}


@router.delete("/campaigns/{campaign_id}")
def delete_campaign(campaign_id: str, user=Depends(get_user)):
    """Delete a campaign and its call logs."""
    supabase.table("call_logs").delete().eq("campaign_id", campaign_id).eq("user_id", user["id"]).execute()
    supabase.table("call_campaigns").delete().eq("id", campaign_id).eq("user_id", user["id"]).execute()
    return {"deleted": True, "message": "Campaign deleted"}


@router.post("/campaigns/{campaign_id}/add-contacts")
def add_contacts_to_campaign(campaign_id: str, contact_ids: List[str], user=Depends(get_user)):
    """Add more contacts to an existing campaign."""
    campaign = (
        supabase.table("call_campaigns")
        .select("id")
        .eq("id", campaign_id)
        .eq("user_id", user["id"])
        .single()
        .execute()
    )
    if not campaign.data:
        raise HTTPException(status_code=404, detail="Campaign not found")

    existing = (
        supabase.table("call_logs")
        .select("contact_id")
        .eq("campaign_id", campaign_id)
        .execute()
    )
    existing_ids = {l["contact_id"] for l in (existing.data or [])}
    new_ids = [cid for cid in contact_ids if cid not in existing_ids]

    if not new_ids:
        return {"added": 0, "message": "All contacts already in campaign"}

    call_logs = [
        {"campaign_id": campaign_id, "user_id": user["id"], "contact_id": cid, "outcome": "pending"}
        for cid in new_ids
    ]
    supabase.table("call_logs").insert(call_logs).execute()

    supabase.table("call_campaigns").update(
        {"total_contacts": len(existing_ids) + len(new_ids)}
    ).eq("id", campaign_id).execute()

    return {"added": len(new_ids), "message": f"Added {len(new_ids)} contacts to campaign"}


# ── Call Logs ────────────────────────────────────────────────────────


@router.post("/log")
def log_call(payload: CallLogCreate, user=Depends(get_user)):
    """Log a call outcome for a contact in a campaign."""
    result = (
        supabase.table("call_logs")
        .update({
            "outcome": payload.outcome,
            "duration_seconds": payload.duration_seconds,
            "notes": payload.notes,
            "callback_at": payload.callback_at,
            "called_at": datetime.utcnow().isoformat(),
        })
        .eq("campaign_id", payload.campaign_id)
        .eq("contact_id", payload.contact_id)
        .eq("user_id", user["id"])
        .execute()
    )
    if not result.data:
        data = {
            "campaign_id": payload.campaign_id,
            "user_id": user["id"],
            "contact_id": payload.contact_id,
            "outcome": payload.outcome,
            "duration_seconds": payload.duration_seconds,
            "notes": payload.notes,
            "callback_at": payload.callback_at,
            "called_at": datetime.utcnow().isoformat(),
        }
        result = supabase.table("call_logs").insert(data).execute()

    return {"call_log": (result.data or [{}])[0], "message": "Call logged"}


@router.patch("/log/{log_id}")
def update_call_log(log_id: str, payload: CallLogUpdate, user=Depends(get_user)):
    """Update a call log entry."""
    data = payload.model_dump(exclude_none=True)
    if not data:
        raise HTTPException(status_code=400, detail="No fields to update")

    result = (
        supabase.table("call_logs")
        .update(data)
        .eq("id", log_id)
        .eq("user_id", user["id"])
        .execute()
    )
    if not result.data:
        raise HTTPException(status_code=404, detail="Call log not found")
    return {"call_log": result.data[0], "message": "Call log updated"}


@router.get("/next/{campaign_id}")
def get_next_call(campaign_id: str, user=Depends(get_user)):
    """Get the next pending contact to call in a campaign."""
    result = (
        supabase.table("call_logs")
        .select("*, contacts(id, first_name, last_name, phone, email, company, title, agency, notes)")
        .eq("campaign_id", campaign_id)
        .eq("user_id", user["id"])
        .eq("outcome", "pending")
        .order("created_at", desc=False)
        .limit(1)
        .execute()
    )
    if not result.data:
        return {"next_contact": None, "message": "No more pending calls in this campaign"}

    return {"next_contact": result.data[0]}


@router.get("/callbacks")
def get_callbacks(user=Depends(get_user)):
    """Get all scheduled callbacks across campaigns."""
    result = (
        supabase.table("call_logs")
        .select("*, contacts(id, first_name, last_name, phone, company), call_campaigns(id, name)")
        .eq("user_id", user["id"])
        .eq("outcome", "callback")
        .not_.is_("callback_at", "null")
        .order("callback_at", desc=False)
        .execute()
    )
    return {"callbacks": result.data or []}


@router.get("/stats")
def get_call_stats(user=Depends(get_user)):
    """Get overall call statistics across all campaigns."""
    campaigns = (
        supabase.table("call_campaigns")
        .select("id, name, status, total_contacts, created_at")
        .eq("user_id", user["id"])
        .execute()
    )

    all_logs = (
        supabase.table("call_logs")
        .select("outcome, duration_seconds")
        .eq("user_id", user["id"])
        .execute()
    )
    logs = all_logs.data or []

    total_calls = len([l for l in logs if l["outcome"] != "pending"])
    total_duration = sum(l.get("duration_seconds", 0) or 0 for l in logs)
    connected = len([l for l in logs if l["outcome"] in ("connected", "interested", "closed", "callback")])

    return {
        "total_campaigns": len(campaigns.data or []),
        "total_contacts_queued": len(logs),
        "total_calls_made": total_calls,
        "total_connected": connected,
        "connect_rate": round((connected / total_calls * 100), 1) if total_calls > 0 else 0,
        "total_duration_seconds": total_duration,
        "total_interested": len([l for l in logs if l["outcome"] == "interested"]),
        "total_closed": len([l for l in logs if l["outcome"] == "closed"]),
        "total_callbacks": len([l for l in logs if l["outcome"] == "callback"]),
    }

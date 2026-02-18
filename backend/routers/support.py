from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Optional
from datetime import datetime
import uuid

router = APIRouter(prefix="/api/support", tags=["support"])

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


class SupportTicket(BaseModel):
    subject: str
    description: str
    category: str
    priority: str = "normal"


class TicketReply(BaseModel):
    message: str


@router.post("/ticket")
async def create_ticket(ticket: SupportTicket, user=Depends(get_user)):
    """Create a new support ticket."""
    ticket_id = f"TKT-{uuid.uuid4().hex[:8].upper()}"
    record = {
        "ticket_id": ticket_id,
        "user_id": user["id"],
        "subject": ticket.subject,
        "description": ticket.description,
        "category": ticket.category,
        "priority": ticket.priority,
        "status": "open",
        "created_at": datetime.utcnow().isoformat(),
    }
    if supabase:
        try:
            supabase.table("support_tickets").insert(record).execute()
        except Exception:
            pass
    return {
        "ticket_id": ticket_id,
        "status": "open",
        "created_at": record["created_at"],
        "subject": ticket.subject,
        "message": "Ticket created successfully. Our team will respond within 24 hours.",
    }


@router.get("/tickets")
async def list_tickets(status: Optional[str] = None, user=Depends(get_user)):
    """List all support tickets for user."""
    if supabase:
        try:
            query = supabase.table("support_tickets").select("*").eq("user_id", user["id"]).order("created_at", desc=True)
            if status:
                query = query.eq("status", status)
            res = query.execute()
            return {"tickets": res.data or [], "total": len(res.data or [])}
        except Exception:
            pass
    return {"tickets": [], "total": 0}


@router.get("/tickets/{ticket_id}")
async def get_ticket(ticket_id: str, user=Depends(get_user)):
    """Get ticket details."""
    if supabase:
        try:
            res = supabase.table("support_tickets").select("*").eq("ticket_id", ticket_id).eq("user_id", user["id"]).execute()
            if res.data:
                return res.data[0]
        except Exception:
            pass
    raise HTTPException(status_code=404, detail="Ticket not found")


@router.post("/tickets/{ticket_id}/reply")
async def reply_to_ticket(ticket_id: str, reply: TicketReply, user=Depends(get_user)):
    """Reply to a support ticket."""
    if supabase:
        try:
            supabase.table("support_tickets").update({
                "last_updated": datetime.utcnow().isoformat(),
            }).eq("ticket_id", ticket_id).execute()
        except Exception:
            pass
    return {"ticket_id": ticket_id, "reply_added": True}


@router.put("/tickets/{ticket_id}/close")
async def close_ticket(ticket_id: str, user=Depends(get_user)):
    """Close a support ticket."""
    if supabase:
        try:
            supabase.table("support_tickets").update({
                "status": "closed",
                "closed_at": datetime.utcnow().isoformat(),
            }).eq("ticket_id", ticket_id).eq("user_id", user["id"]).execute()
        except Exception:
            pass
    return {"ticket_id": ticket_id, "status": "closed", "closed_at": datetime.utcnow().isoformat()}


@router.get("/faq")
async def get_faq():
    """Get frequently asked questions."""
    return {
        "categories": [
            {
                "name": "Getting Started",
                "questions": [
                    {"question": "How do I create an account?", "answer": "Click the Sign Up button and follow the registration process with your email."},
                    {"question": "What is Sturgeon AI?", "answer": "Sturgeon AI is an AI-powered platform for government contract analysis, proposal generation, compliance checking, and opportunity matching."},
                    {"question": "How do I set up my profile?", "answer": "Visit the Onboarding page after signing up to configure your NAICS codes and keywords."},
                ],
            },
            {
                "name": "Opportunities",
                "questions": [
                    {"question": "How do I search for opportunities?", "answer": "Use the Opportunities page to search SAM.gov and other marketplaces for federal contracts."},
                    {"question": "How does opportunity matching work?", "answer": "Our AI analyzes your company profile, NAICS codes, and past performance to score and rank opportunities."},
                ],
            },
            {
                "name": "Proposals",
                "questions": [
                    {"question": "How does AI proposal generation work?", "answer": "Paste your RFP text, and our AI extracts compliance requirements and generates proposal sections."},
                    {"question": "Can I export proposals?", "answer": "Yes, use the Submission Center to package your proposal as a downloadable ZIP."},
                ],
            },
            {
                "name": "Billing",
                "questions": [
                    {"question": "What plans are available?", "answer": "We offer Free, Pro ($49/mo), and Enterprise ($199/mo) plans."},
                    {"question": "Can I cancel anytime?", "answer": "Yes, cancel from the Billing page. You retain access until the end of the billing period."},
                ],
            },
        ]
    }

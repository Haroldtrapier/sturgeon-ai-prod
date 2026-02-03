from fastapi import APIRouter, HTTPException, UploadFile, File
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

router = APIRouter(prefix="/api/support", tags=["support"])

class SupportTicket(BaseModel):
    subject: str
    description: str
    category: str
    priority: str = "normal"
    attachments: Optional[List[str]] = []

@router.post("/ticket")
async def create_ticket(ticket: SupportTicket):
    """Create a new support ticket"""
    return {
        "ticket_id": "TKT-12345",
        "status": "open",
        "created_at": datetime.now().isoformat(),
        "subject": ticket.subject,
        "message": "Ticket created successfully. Our team will respond within 24 hours."
    }

@router.get("/tickets")
async def list_tickets(
    user_id: Optional[str] = None,
    status: Optional[str] = None
):
    """List all support tickets for user"""
    return {
        "tickets": [
            {
                "ticket_id": "TKT-12345",
                "subject": "Sample Ticket",
                "status": "open",
                "priority": "normal",
                "created_at": datetime.now().isoformat(),
                "last_updated": datetime.now().isoformat()
            }
        ],
        "total": 1
    }

@router.get("/tickets/{ticket_id}")
async def get_ticket(ticket_id: str):
    """Get ticket details"""
    return {
        "ticket_id": ticket_id,
        "subject": "Sample Ticket",
        "description": "Ticket description",
        "status": "open",
        "messages": [],
        "attachments": []
    }

@router.post("/tickets/{ticket_id}/reply")
async def reply_to_ticket(
    ticket_id: str,
    message: str,
    attachments: List[UploadFile] = File(None)
):
    """Reply to a support ticket"""
    return {
        "ticket_id": ticket_id,
        "reply_added": True,
        "attachments_count": len(attachments) if attachments else 0
    }

@router.put("/tickets/{ticket_id}/close")
async def close_ticket(ticket_id: str):
    """Close a support ticket"""
    return {
        "ticket_id": ticket_id,
        "status": "closed",
        "closed_at": datetime.now().isoformat()
    }

@router.get("/faq")
async def get_faq():
    """Get frequently asked questions"""
    return {
        "categories": [
            {
                "name": "Getting Started",
                "questions": [
                    {
                        "question": "How do I create an account?",
                        "answer": "Click the Sign Up button and follow the registration process."
                    }
                ]
            },
            {
                "name": "Opportunities",
                "questions": [
                    {
                        "question": "How do I search for opportunities?",
                        "answer": "Use the Opportunities page to search and filter government contracts."
                    }
                ]
            }
        ]
    }

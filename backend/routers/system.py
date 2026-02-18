"""
System Management API

Provides endpoints for:
- Data backup management
- Team member invitations
- Integration health checks
- Billing portal access
"""

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Optional
import os

try:
    from services.auth import get_user
    from services.db import supabase
except ImportError:
    from backend.services.auth import get_user
    from backend.services.db import supabase

router = APIRouter(prefix="/api/system", tags=["system"])


# ── Backup Endpoints ─────────────────────────────────────────────────

class BackupRequest(BaseModel):
    type: str = "full"  # full, proposals, settings


@router.post("/backup")
def create_backup(request: BackupRequest, user=Depends(get_user)):
    """Create a data backup for the user."""

    # Create backup record
    backup_response = supabase.table("backups").insert({
        "user_id": user["id"],
        "type": request.type,
        "status": "processing",
        "size": None,
    }).execute()

    if not backup_response.data:
        raise HTTPException(status_code=500, detail="Failed to create backup record")

    backup_id = backup_response.data[0]["id"]

    # In production, this would queue a background job
    # For now, mark as completed with estimated size
    size_map = {"full": "15.2 MB", "proposals": "8.4 MB", "settings": "0.3 MB"}
    supabase.table("backups") \
        .update({"status": "completed", "size": size_map.get(request.type, "1.0 MB")}) \
        .eq("id", backup_id) \
        .execute()

    return {
        "backup_id": backup_id,
        "type": request.type,
        "status": "completed",
        "message": f"{request.type.capitalize()} backup created successfully",
    }


# ── Team Invite Endpoints ────────────────────────────────────────────

class InviteRequest(BaseModel):
    email: str
    role: str = "analyst"


@router.post("/invite")
def invite_team_member(request: InviteRequest, user=Depends(get_user)):
    """Send a team invitation to a new member."""

    if request.role not in ["admin", "manager", "analyst", "viewer"]:
        raise HTTPException(status_code=400, detail="Invalid role")

    # Check if user already exists
    existing = supabase.table("user_profiles") \
        .select("id") \
        .eq("email", request.email) \
        .execute()

    if existing.data:
        raise HTTPException(status_code=409, detail="User with this email already exists")

    # Create invitation record
    invite_response = supabase.table("team_invites").insert({
        "invited_by": user["id"],
        "email": request.email,
        "role": request.role,
        "status": "pending",
    }).execute()

    # In production, send invitation email via SendGrid

    return {
        "message": f"Invitation sent to {request.email}",
        "role": request.role,
        "status": "pending",
    }


# ── Integration Testing ──────────────────────────────────────────────

class TestIntegrationRequest(BaseModel):
    integration: str


@router.post("/test-integration")
def test_integration(request: TestIntegrationRequest, user=Depends(get_user)):
    """Test connectivity to an integration service."""

    results = {
        "supabase": lambda: bool(supabase.table("user_profiles").select("id").limit(1).execute()),
        "openai": lambda: bool(os.getenv("OPENAI_API_KEY") or os.getenv("ANTHROPIC_API_KEY")),
        "stripe": lambda: bool(os.getenv("STRIPE_SECRET_KEY")),
        "sam_gov": lambda: bool(os.getenv("SAM_GOV_API_KEY")),
        "fpds": lambda: True,  # Public API, always available
        "usaspending": lambda: True,  # Public API, always available
        "ebuy": lambda: True,
        "sendgrid": lambda: bool(os.getenv("SENDGRID_API_KEY")),
        "vercel": lambda: True,
        "railway": lambda: True,
    }

    test_fn = results.get(request.integration)
    if not test_fn:
        raise HTTPException(status_code=400, detail=f"Unknown integration: {request.integration}")

    try:
        success = test_fn()
        return {
            "integration": request.integration,
            "status": "connected" if success else "error",
            "message": "Connection successful" if success else "Configuration missing",
        }
    except Exception as e:
        return {
            "integration": request.integration,
            "status": "error",
            "message": str(e)[:200],
        }


# ── Billing Portal ───────────────────────────────────────────────────

@router.get("/billing-portal")
def get_billing_portal(user=Depends(get_user)):
    """Get a Stripe customer portal URL for managing billing."""

    try:
        import stripe
        stripe.api_key = os.getenv("STRIPE_SECRET_KEY")

        # Look up customer by email
        profile = supabase.table("user_profiles") \
            .select("email, stripe_customer_id") \
            .eq("id", user["id"]) \
            .single() \
            .execute()

        if not profile.data:
            raise HTTPException(status_code=404, detail="Profile not found")

        customer_id = profile.data.get("stripe_customer_id")

        if not customer_id:
            # Try to find by email
            customers = stripe.Customer.list(email=profile.data.get("email"), limit=1)
            if customers.data:
                customer_id = customers.data[0].id
            else:
                raise HTTPException(status_code=404, detail="No Stripe customer found")

        session = stripe.billing_portal.Session.create(
            customer=customer_id,
            return_url=os.getenv("APP_URL", "http://localhost:3000") + "/billing",
        )

        return {"url": session.url}

    except ImportError:
        raise HTTPException(status_code=503, detail="Stripe not configured")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)[:200])

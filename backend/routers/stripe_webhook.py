"""
Stripe Webhook Handler

Handles Stripe events to keep subscription state in sync.

Events handled:
- checkout.session.completed (new subscription)
- customer.subscription.updated (plan change, renewal)
- customer.subscription.deleted (cancellation)
"""

import os
import stripe
from fastapi import APIRouter, Request, HTTPException
from backend.services.db import supabase

router = APIRouter(prefix="/stripe", tags=["stripe"])

stripe.api_key = os.getenv("STRIPE_SECRET_KEY")
webhook_secret = os.getenv("STRIPE_WEBHOOK_SECRET")


@router.post("/webhook")
async def webhook(request: Request):
    """
    Handle Stripe webhook events.
    
    Verifies signature and updates user subscription state in database.
    """
    
    payload = await request.body()
    sig_header = request.headers.get("stripe-signature")
    
    if not webhook_secret:
        raise HTTPException(status_code=500, detail="Webhook secret not configured")
    
    try:
        event = stripe.Webhook.construct_event(
            payload=payload,
            sig_header=sig_header,
            secret=webhook_secret
        )
    except ValueError as e:
        # Invalid payload
        raise HTTPException(status_code=400, detail=f"Invalid payload: {e}")
    except stripe.error.SignatureVerificationError as e:
        # Invalid signature
        raise HTTPException(status_code=400, detail=f"Invalid signature: {e}")
    
    event_type = event["type"]
    data_object = event["data"]["object"]
    
    # Handle subscription events
    if event_type == "checkout.session.completed":
        # New subscription created
        metadata = data_object.get("metadata", {})
        user_id = metadata.get("user_id")
        plan = metadata.get("plan", "free")
        
        if user_id:
            supabase.table("users").update({
                "plan": plan,
                "stripe_customer_id": data_object.get("customer")
            }).eq("id", user_id).execute()
            
            print(f"✅ User {user_id} subscribed to {plan}")
    
    elif event_type == "customer.subscription.updated":
        # Subscription updated (plan change, renewal)
        customer_id = data_object.get("customer")
        status = data_object.get("status")
        plan_id = data_object.get("items", {}).get("data", [{}])[0].get("price", {}).get("id")
        
        # Map Stripe price ID to plan name
        plan_map = {
            os.getenv("STRIPE_STARTER_PRICE_ID"): "starter",
            os.getenv("STRIPE_PRO_PRICE_ID"): "pro",
            os.getenv("STRIPE_ENTERPRISE_PRICE_ID"): "enterprise"
        }
        plan = plan_map.get(plan_id, "free")
        
        if status == "active":
            supabase.table("users").update({
                "plan": plan
            }).eq("stripe_customer_id", customer_id).execute()
            
            print(f"✅ Subscription updated: {customer_id} → {plan}")
    
    elif event_type == "customer.subscription.deleted":
        # Subscription cancelled
        customer_id = data_object.get("customer")
        
        supabase.table("users").update({
            "plan": "free"
        }).eq("stripe_customer_id", customer_id).execute()
        
        print(f"✅ Subscription cancelled: {customer_id}")
    
    return {"received": True, "event_type": event_type}

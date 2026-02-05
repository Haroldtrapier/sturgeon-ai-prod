import os
import stripe
from backend.services.db import supabase

stripe.api_key = os.getenv("STRIPE_SECRET_KEY")

def create_checkout_session(user_id: str, plan: str, email: str):
    """Create Stripe checkout session for subscription"""
    
    # Get price ID from environment
    price_id = os.getenv(f"STRIPE_{plan.upper()}_PRICE_ID")
    
    if not price_id:
        raise ValueError(f"No price ID configured for plan: {plan}")
    
    try:
        session = stripe.checkout.Session.create(
            mode="subscription",
            line_items=[{"price": price_id, "quantity": 1}],
            success_url=os.getenv("STRIPE_SUCCESS_URL", "http://localhost:3000/dashboard?payment=success"),
            cancel_url=os.getenv("STRIPE_CANCEL_URL", "http://localhost:3000/billing?payment=cancel"),
            customer_email=email,
            metadata={
                "user_id": user_id,
                "plan": plan
            }
        )
        return session
    except Exception as e:
        raise Exception(f"Failed to create checkout session: {str(e)}")

def handle_webhook(payload: dict, signature: str):
    """Handle Stripe webhook events"""
    
    webhook_secret = os.getenv("STRIPE_WEBHOOK_SECRET")
    
    if not webhook_secret:
        raise ValueError("Stripe webhook secret not configured")
    
    try:
        event = stripe.Webhook.construct_event(
            payload, signature, webhook_secret
        )
    except Exception as e:
        raise Exception(f"Webhook signature verification failed: {str(e)}")
    
    # Handle different event types
    if event["type"] == "checkout.session.completed":
        session = event["data"]["object"]
        user_id = session["metadata"]["user_id"]
        plan = session["metadata"]["plan"]
        
        # Update user plan
        supabase.table("users").update({"plan": plan}).eq("id", user_id).execute()
        
        # Create subscription record
        supabase.table("subscriptions").insert({
            "user_id": user_id,
            "stripe_customer_id": session.get("customer"),
            "stripe_subscription_id": session.get("subscription"),
            "status": "active",
            "plan": plan
        }).execute()
    
    elif event["type"] == "customer.subscription.deleted":
        subscription = event["data"]["object"]
        
        # Update subscription status
        result = supabase.table("subscriptions") \
            .select("user_id") \
            .eq("stripe_subscription_id", subscription["id"]) \
            .execute()
        
        if result.data:
            user_id = result.data[0]["user_id"]
            
            # Downgrade to free
            supabase.table("users").update({"plan": "free"}).eq("id", user_id).execute()
            
            # Update subscription status
            supabase.table("subscriptions") \
                .update({"status": "canceled"}) \
                .eq("stripe_subscription_id", subscription["id"]) \
                .execute()
    
    return {"status": "success"}

def get_user_subscription(user_id: str):
    """Get active subscription for user"""
    result = supabase.table("subscriptions") \
        .select("*") \
        .eq("user_id", user_id) \
        .eq("status", "active") \
        .execute()
    
    return result.data[0] if result.data else None

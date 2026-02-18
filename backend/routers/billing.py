import stripe
import os
from fastapi import APIRouter, Request, HTTPException, Depends
from pydantic import BaseModel

try:
    from services.auth import get_user
    from services.db import supabase
except ImportError:
    from backend.services.auth import get_user
    from backend.services.db import supabase

router = APIRouter(prefix="/billing", tags=["billing"])

stripe.api_key = os.getenv("STRIPE_SECRET_KEY", "")
WEBHOOK_SECRET = os.getenv("STRIPE_WEBHOOK_SECRET", "")

STRIPE_PRICES = {
    "free": None,
    "pro": os.getenv("STRIPE_PRICE_PRO", "price_pro_monthly"),
    "enterprise": os.getenv("STRIPE_PRICE_ENTERPRISE", "price_enterprise_monthly"),
}


class CheckoutRequest(BaseModel):
    plan: str


@router.get("/plans")
async def get_plans():
    """Get available subscription plans."""
    return {
        "plans": [
            {"id": "free", "name": "Free", "price": 0, "features": ["Basic features", "10 proposals"]},
            {"id": "pro", "name": "Pro", "price": 49, "features": ["Unlimited proposals", "AI assistance", "ContractMatch"]},
            {"id": "enterprise", "name": "Enterprise", "price": 199, "features": ["All Pro features", "Priority support", "Team collaboration"]},
        ]
    }


@router.post("/create-checkout")
async def create_checkout_session(request: CheckoutRequest, user=Depends(get_user)):
    """Create Stripe checkout session for subscription."""
    plan_id = request.plan
    if plan_id not in STRIPE_PRICES or not STRIPE_PRICES[plan_id]:
        raise HTTPException(status_code=400, detail="Invalid plan")

    try:
        checkout_session = stripe.checkout.Session.create(
            payment_method_types=["card"],
            line_items=[{"price": STRIPE_PRICES[plan_id], "quantity": 1}],
            mode="subscription",
            client_reference_id=user["id"],
            success_url=os.getenv("APP_URL", "http://localhost:3000") + "/dashboard?success=true",
            cancel_url=os.getenv("APP_URL", "http://localhost:3000") + "/dashboard?cancelled=true",
        )
        return {"url": checkout_session.url}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/subscription")
async def get_subscription(user=Depends(get_user)):
    """Get current user's subscription status."""
    profile = supabase.table("user_profiles").select("subscription_plan").eq("id", user["id"]).execute()
    if not profile.data:
        return {"status": "inactive", "plan": "free", "next_billing_date": None}

    plan = profile.data[0].get("subscription_plan", "free")
    return {
        "status": "active" if plan != "free" else "inactive",
        "plan": plan,
        "next_billing_date": None,
    }


@router.post("/webhook")
async def stripe_webhook(request: Request):
    """Handle Stripe webhook events for subscription management."""
    payload = await request.body()
    sig = request.headers.get("stripe-signature")

    try:
        event = stripe.Webhook.construct_event(payload, sig, WEBHOOK_SECRET)
    except Exception as e:
        print(f"[Sturgeon AI] Webhook error: {e}")
        return {"error": "Invalid webhook"}

    if event["type"] == "checkout.session.completed":
        session = event["data"]["object"]
        user_id = session.get("client_reference_id")
        if user_id:
            supabase.table("user_profiles") \
                .update({"subscription_plan": "pro"}) \
                .eq("id", user_id) \
                .execute()
            print(f"[Sturgeon AI] Subscription activated for user {user_id}")

    elif event["type"] == "customer.subscription.deleted":
        subscription = event["data"]["object"]
        # Find user by stripe customer and downgrade
        print(f"[Sturgeon AI] Subscription cancelled: {subscription.get('id')}")

    elif event["type"] == "invoice.payment_failed":
        invoice = event["data"]["object"]
        print(f"[Sturgeon AI] Payment failed for: {invoice.get('customer_email')}")

    return {"received": True}


@router.post("/cancel")
async def cancel_subscription(user=Depends(get_user)):
    """Cancel user's subscription."""
    try:
        email = user.get("email")
        customers = stripe.Customer.list(email=email, limit=1)

        if not customers.data:
            raise HTTPException(status_code=404, detail="No customer found")

        subscriptions = stripe.Subscription.list(customer=customers.data[0].id, status="active", limit=1)
        if not subscriptions.data:
            return {"message": "No active subscription found", "status": "no_subscription"}

        cancelled = stripe.Subscription.cancel(subscriptions.data[0].id)

        supabase.table("user_profiles") \
            .update({"subscription_plan": "free"}) \
            .eq("id", user["id"]) \
            .execute()

        return {"message": "Subscription cancelled", "status": "cancelled", "subscription_id": cancelled.id}
    except stripe.error.StripeError as e:
        raise HTTPException(status_code=400, detail=f"Stripe error: {str(e)}")


@router.get("/portal")
async def get_billing_portal(user=Depends(get_user)):
    """Get Stripe Customer Portal URL."""
    try:
        email = user.get("email")
        customers = stripe.Customer.list(email=email, limit=1)
        if not customers.data:
            raise HTTPException(status_code=404, detail="No customer found")

        session = stripe.billing_portal.Session.create(
            customer=customers.data[0].id,
            return_url=os.getenv("APP_URL", "http://localhost:3000") + "/billing",
        )
        return {"url": session.url}
    except stripe.error.StripeError as e:
        raise HTTPException(status_code=400, detail=f"Stripe error: {str(e)}")

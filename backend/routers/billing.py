import stripe
import os
from fastapi import APIRouter, Request, HTTPException, Depends
from sqlalchemy.orm import Session
from database import get_db

router = APIRouter(prefix="/billing", tags=["Billing"])

stripe.api_key = os.getenv("STRIPEESECRET_KEY", "YOUR_STRIPE_SECRET")
WEBHOOK_SECRET = os.getenv("STRIPE_WEBHOOK_SECRET", "YOUR_WEBHOOK_SECRET")


@router.get("/plans")
async def get_plans():
    """Get available subscription plans."""
    return {
        "plans": [
            {
                "id": "free",
                "name": "Free",
                "price": 0,
                "features": ["Basic features", "10 proposals"]
            },
            {
                "id": "pro",
                "name": "Pro",
                "price": 49,
                "features": ["Unlimited proposals", "AI assistance", "ContractMatch"]
            },
            {
                "id": "enterprise",
                "name": "Enterprise",
                "price": 199,
                "features": ["All Pro features", "Priority support", "Team collaboration"]
            }
        ]
    }


@router.post("/create-checkout")
async def create_checkout_session(plan_id: str, db: Session = Depends(get_db)):
    """Create Stripe checkout session for subscription."""
    try:
        # TODO: Map plan_id to Stripe price IDs
        checkout_session = stripe.checkout.Session.create(
            payment_method_types=["card"],
            line_items=[
                {
                    "price": "PRICE_ID_HERE",  # TODO: Replace with real price ID
                    "quantity": 1,
                }
            ],
            mode="subscription",
            success_url="https://yourapp.com/success",
            cancel_url="https://yourapp.com/cancel",
        )
        return {"url": checkout_session.url}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/subscription")
async def get_subscription(db: Session = Depends(get_db)):
    """Get current user's subscription status."""
    # TODO: Query user's subscription from database
    return {
        "status": "active",
        "plan": "free",
        "next_billing_date": None
    }


@router.post("/webhook")
async def stripe_webhook(request: Request, db: Session = Depends(get_db)):
    """
    Handle Stripe webhook events for subscription management.
    """
    payload = await request.body()
    sig = request.headers.get("stripe-signature")

    try:
        event = stripe.Webhook.construct_event(
            payload, sig, WEBHOOK_SECRET
        )
    except Exception as e:
        print(f"❌ Webhook error: {e}")
        return {"error": "Invalid webhook"}

    # Handle subscription events
    if event["type"] == "checkout.session.completed":
        session = event["data"]["object"]
        print(f"✅ Subscription created: {session.get('id')}")
        # TODO: Update user's subscription in database

    elif event["type"] == "customer.subscription.deleted":
        subscription = event["data"]["object"]
        print(f"❌ Subscription cancelled: {subscription.get('id')}")
        # TODO: Update user's subscription status

    elif event["type"] == "invoice.payment_failed":
        invoice = event["data"]["object"]
        print(f"❌ Payment failed for invoice: {invoice.get('id')}")
        # TODO: Notify user of payment failure

    return {"received": True}


@router.post("/cancel")
async def cancel_subscription(db: Session = Depends(get_db)):
    """Cancel user's subscription."""
    # TODO: Get user's Stripe subscription ID and cancel
    return {"message": "Subscription cancelled"}

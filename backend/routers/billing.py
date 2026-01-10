import stripe
import os
from fastapi import APIRouter, Request, HTTPException, Depends
from sqlalchemy.orm import Session
from database import get_db

router = APIRouter(prefix="/billing", tags=["Billing"])

stripe.api_key = os.getenv("STRIPE_SECRET_KEY", "YOUR_STRIPE_SECRET")
WEBHOOK_SECRET = os.getenv("STRIPE_WEBHOOK_SECRET", "YOUR_WEBHOOK_SECRET")

# Stripe Price IDs - Set these in your environment or here
STRIPE_PRICES = {
    "free": None,  # Free tier doesn't need a price ID
    "pro": os.getenv("STRIPE_PRICE_PRO", "price_pro_monthly"),
    "enterprise": os.getenv("STRIPE_PRICE_ENTERPRISE", "price_enterprise_monthly")
}


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
async def create_checkout_session(plan_id: str, user_id: str, db: Session = Depends(get_db)):
    """Create Stripe checkout session for subscription."""
    try:
        if plan_id not in STRIPE_PRICES or not STRIPE_PRICES[plan_id]:
            raise HTTPException(status_code=400, detail="Invalid plan")
        
        checkout_session = stripe.checkout.Session.create(
            payment_method_types=["card"],
            line_items=[
                {
                    "price": STRIPE_PRICES[plan_id],
                    "quantity": 1,
                }
            ],
            mode="subscription",
            client_reference_id=user_id,
            success_url=os.getenv("APP_URL", "http://localhost:3000") + "/dashboard?success=true",
            cancel_url=os.getenv("APP_URL", "http://localhost:3000") + "/dashboard?cancelled=true",
        )
        return {"url": checkout_session.url}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/subscription")
async def get_subscription(user_id: str, db: Session = Depends(get_db)):
    """Get current user's subscription status."""
    try:
        # Query from user_profiles table
        from database import User
        user = db.query(User).filter(User.id == user_id).first()
        
        if not user:
            return {"status": "inactive", "plan": "free", "next_billing_date": None}
        
        return {
            "status": "active" if getattr(user, "is_active", True) else "inactive",
            "plan": getattr(user, "subscription_plan", "free"),
            "next_billing_date": None  # Implement with Stripe subscription data
        }
    except Exception as e:
        return {"status": "error", "plan": "free", "error": str(e)}


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
        user_id = session.get("client_reference_id")
        subscription_id = session.get("subscription")
        
        if user_id and subscription_id:
            # Update user's subscription in database
            from database import User
            user = db.query(User).filter(User.id == user_id).first()
            if user:
                # Store subscription_id in user metadata or separate table
                print(f"✅ Subscription created for user {user_id}: {subscription_id}")

    elif event["type"] == "customer.subscription.deleted":
        subscription = event["data"]["object"]
        subscription_id = subscription.get("id")
        
        # Update user's subscription status to free
        print(f"❌ Subscription cancelled: {subscription_id}")
        # Query and update user status

    elif event["type"] == "invoice.payment_failed":
        invoice = event["data"]["object"]
        customer_email = invoice.get("customer_email")
        
        # Notify user of payment failure via email or in-app notification
        print(f"❌ Payment failed for customer: {customer_email}")

    return {"received": True}


@router.post("/cancel")
async def cancel_subscription(
    user_email: str,
    db: Session = Depends(get_db)
):
    """Cancel user's subscription."""
    import stripe
    
    try:
        # Search for customer by email
        customers = stripe.Customer.list(email=user_email, limit=1)
        
        if not customers.data:
            raise HTTPException(
                status_code=404,
                detail="No customer found with this email"
            )
        
        customer = customers.data[0]
        
        # Get active subscriptions
        subscriptions = stripe.Subscription.list(
            customer=customer.id,
            status="active",
            limit=1
        )
        
        if not subscriptions.data:
            return {
                "message": "No active subscription found",
                "status": "no_subscription"
            }
        
        subscription = subscriptions.data[0]
        
        # Cancel the subscription
        cancelled_subscription = stripe.Subscription.cancel(subscription.id)
        
        print(f"✅ Subscription cancelled for {user_email}")
        
        return {
            "message": "Subscription cancelled successfully",
            "status": "cancelled",
            "subscription_id": cancelled_subscription.id,
            "cancel_at": cancelled_subscription.cancel_at
        }
        
    except stripe.error.StripeError as e:
        raise HTTPException(
            status_code=400,
            detail=f"Stripe error: {str(e)}"
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error cancelling subscription: {str(e)}"
        )

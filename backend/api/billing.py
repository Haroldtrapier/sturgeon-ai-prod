"""
Billing API Router - Stripe Webhook Handler
"""
import stripe
from fastapi import APIRouter, Request, HTTPException
from backend.config import config

router = APIRouter(prefix="/billing", tags=["Billing"])

# Set Stripe API key from config
stripe.api_key = config.STRIPE_SECRET_KEY


@router.post("/webhook")
async def stripe_webhook(request: Request):
    """
    Stripe webhook endpoint for handling subscription events.

    This endpoint verifies and processes Stripe webhook events, particularly
    for subscription lifecycle management.
    """
    payload = await request.body()
    sig = request.headers.get("stripe-signature")

    # Validate that stripe-signature header is present
    if not sig:
        raise HTTPException(status_code=400, detail="Missing stripe-signature header")

    try:
        event = stripe.Webhook.construct_event(
            payload, sig, config.STRIPE_WEBHOOK_SECRET
        )
    except stripe.error.SignatureVerificationError:
        raise HTTPException(status_code=400, detail="Invalid webhook signature")
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Webhook error: {str(e)}")

    # Handle subscription events
    if event["type"] == "checkout.session.completed":
        # Process checkout session completion
        # This is where you would handle post-payment logic
        pass

    return {"received": True}

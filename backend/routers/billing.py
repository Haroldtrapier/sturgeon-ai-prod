import stripe
from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from pydantic import BaseModel
from enum import Enum
from typing import Literal
import logging
from ..auth import get_current_user
from ..config import settings
from ..database import get_db
from ..models import User, Subscription

logger = logging.getLogger(__name__)

router = APIRouter()
stripe.api_key = settings.STRIPE_SECRET_KEY

PLAN_PRICE_MAP = {
    "basic": settings.STRIPE_BASIC_PRICE_ID,
    "pro": settings.STRIPE_PRO_PRICE_ID,
    "enterprise": settings.STRIPE_ENTERPRISE_PRICE_ID,
}


class PlanType(str, Enum):
    """Valid subscription plans"""
    BASIC = "basic"
    PRO = "pro"
    ENTERPRISE = "enterprise"


class CheckoutSessionRequest(BaseModel):
    """Request model for checkout session creation"""
    plan: Literal["basic", "pro", "enterprise"]


def map_plan_to_price_id(plan: str) -> str:
    try:
        return PLAN_PRICE_MAP[plan]
    except KeyError:
        raise HTTPException(status_code=400, detail="Invalid plan")


@router.post("/checkout-session")
def create_checkout_session(
    request: CheckoutSessionRequest,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    price_id = map_plan_to_price_id(request.plan)

    session = stripe.checkout.Session.create(
        mode="subscription",
        customer_email=user.email,
        line_items=[{"price": price_id, "quantity": 1}],
        success_url=f"{settings.FRONTEND_URL}/billing/success",
        cancel_url=f"{settings.FRONTEND_URL}/billing/cancel",
        metadata={
            "user_id": str(user.id),
            "plan": request.plan,
        },
    )

    return {"checkout_url": session.url}


@router.post("/webhook")
async def stripe_webhook(request: Request, db: Session = Depends(get_db)):
    sig_header = request.headers.get("stripe-signature")
    payload = await request.body()

    try:
        event = stripe.Webhook.construct_event(
            payload, sig_header, settings.STRIPE_WEBHOOK_SECRET
        )
    except ValueError as e:
        # Invalid payload
        logger.error(f"Invalid webhook payload: {e}")
        raise HTTPException(status_code=400, detail="Invalid payload")
    except stripe.error.SignatureVerificationError as e:
        # Invalid signature
        logger.error(f"Invalid webhook signature: {e}")
        raise HTTPException(status_code=400, detail="Invalid signature")

    if event["type"] == "checkout.session.completed":
        session = event["data"]["object"]
        metadata = session.get("metadata", {})
        user_id = metadata.get("user_id")
        plan = metadata.get("plan")
        sub_id = session.get("subscription")
        customer_email = session.get("customer_details", {}).get("email")

        # Prefer user_id from metadata, fallback to email lookup
        user = None
        if user_id:
            user = db.query(User).filter(User.id == user_id).one_or_none()
        if not user and customer_email:
            user = db.query(User).filter(User.email == customer_email).one_or_none()

        if user:
            sub = (
                db.query(Subscription)
                .filter(Subscription.user_id == user.id)
                .one_or_none()
            )
            if sub is None:
                sub = Subscription(user_id=user.id)
                db.add(sub)

            sub.stripe_subscription_id = sub_id
            sub.status = "active"
            if plan:
                sub.plan = plan
            db.commit()
        else:
            logger.warning(f"User not found for subscription {sub_id}")

    elif event["type"] == "invoice.payment_failed":
        # Handle failed payment
        invoice = event["data"]["object"]
        sub_id = invoice.get("subscription")

        if sub_id:
            sub = (
                db.query(Subscription)
                .filter(Subscription.stripe_subscription_id == sub_id)
                .one_or_none()
            )
            if sub:
                sub.status = "past_due"
                db.commit()
                logger.info(f"Subscription {sub_id} marked as past_due")

    elif event["type"] == "customer.subscription.deleted":
        # Handle subscription cancellation
        subscription = event["data"]["object"]
        sub_id = subscription.get("id")

        if sub_id:
            sub = (
                db.query(Subscription)
                .filter(Subscription.stripe_subscription_id == sub_id)
                .one_or_none()
            )
            if sub:
                sub.status = "cancelled"
                db.commit()
                logger.info(f"Subscription {sub_id} marked as cancelled")

    return {"received": True}

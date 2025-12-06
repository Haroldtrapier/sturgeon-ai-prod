import stripe
from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from ..auth import get_current_user
from ..config import settings
from ..database import get_db
from ..models import User, Subscription

router = APIRouter()
stripe.api_key = settings.STRIPE_SECRET_KEY

PLAN_PRICE_MAP = {
    "basic": settings.STRIPE_BASIC_PRICE_ID,
    "pro": settings.STRIPE_PRO_PRICE_ID,
    "enterprise": settings.STRIPE_ENTERPRISE_PRICE_ID,
}


def map_plan_to_price_id(plan: str) -> str:
    try:
        return PLAN_PRICE_MAP[plan]
    except KeyError:
        raise HTTPException(status_code=400, detail="Invalid plan")


@router.post("/checkout-session")
def create_checkout_session(
    plan: str,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    price_id = map_plan_to_price_id(plan)

    session = stripe.checkout.Session.create(
        mode="subscription",
        customer_email=user.email,
        line_items=[{"price": price_id, "quantity": 1}],
        success_url=f"{settings.FRONTEND_URL}/billing/success",
        cancel_url=f"{settings.FRONTEND_URL}/billing/cancel",
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
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

    # Handle checkout.session.completed
    if event["type"] == "checkout.session.completed":
        session = event["data"]["object"]
        customer_email = session.get("customer_details", {}).get("email")
        sub_id = session.get("subscription")

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
            db.commit()

    # Handle invoice.payment_failed
    elif event["type"] == "invoice.payment_failed":
        invoice = event["data"]["object"]
        subscription_id = invoice.get("subscription")

        if subscription_id:
            sub = (
                db.query(Subscription)
                .filter(Subscription.stripe_subscription_id == subscription_id)
                .one_or_none()
            )
            if sub:
                sub.status = "past_due"
                db.commit()

    # Handle customer.subscription.deleted
    elif event["type"] == "customer.subscription.deleted":
        subscription = event["data"]["object"]
        subscription_id = subscription.get("id")

        if subscription_id:
            sub = (
                db.query(Subscription)
                .filter(Subscription.stripe_subscription_id == subscription_id)
                .one_or_none()
            )
            if sub:
                sub.status = "canceled"
                db.commit()

    # Handle customer.subscription.updated
    elif event["type"] == "customer.subscription.updated":
        subscription = event["data"]["object"]
        subscription_id = subscription.get("id")
        status = subscription.get("status")
        cancel_at_period_end = subscription.get("cancel_at_period_end", False)
        current_period_end = subscription.get("current_period_end")

        if subscription_id:
            sub = (
                db.query(Subscription)
                .filter(Subscription.stripe_subscription_id == subscription_id)
                .one_or_none()
            )
            if sub:
                sub.status = status
                sub.cancel_at_period_end = cancel_at_period_end
                if current_period_end:
                    from datetime import datetime
                    sub.current_period_end = datetime.fromtimestamp(current_period_end)
                db.commit()

    return {"received": True}

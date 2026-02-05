from fastapi import APIRouter, HTTPException, Depends, Request
from pydantic import BaseModel
from backend.services.auth import get_user
from backend.services.billing import create_checkout_session, handle_webhook, get_user_subscription

router = APIRouter(prefix="/billing", tags=["billing"])

class CheckoutRequest(BaseModel):
    plan: str  # "pro" or "enterprise"

@router.post("/create-checkout")
def create_checkout(req: CheckoutRequest, user=Depends(get_user)):
    """Create Stripe checkout session"""
    
    if req.plan not in ["pro", "enterprise"]:
        raise HTTPException(status_code=400, detail="Invalid plan")
    
    try:
        session = create_checkout_session(
            user_id=user.get("id"),
            plan=req.plan,
            email=user.get("email")
        )
        return {"checkoutUrl": session.url}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/webhook")
async def stripe_webhook(request: Request):
    """Handle Stripe webhook events"""
    
    payload = await request.body()
    signature = request.headers.get("stripe-signature")
    
    if not signature:
        raise HTTPException(status_code=400, detail="Missing stripe-signature header")
    
    try:
        result = handle_webhook(payload, signature)
        return result
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/subscription")
def get_subscription(user=Depends(get_user)):
    """Get user's active subscription"""
    
    subscription = get_user_subscription(user.get("id"))
    
    if not subscription:
        return {"subscription": None, "plan": user.get("plan", "free")}
    
    return {"subscription": subscription, "plan": user.get("plan", "free")}

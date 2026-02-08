"""
Authentication service using Supabase JWT verification.
Validates Bearer tokens from the frontend Supabase auth.
"""
from fastapi import Header, HTTPException
from services.db import supabase, get_user_profile, create_user_profile


def get_user(authorization: str = Header(...)):
    """Extract and validate user from Authorization header (required)."""
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid authorization header")

    token = authorization.replace("Bearer ", "")

    try:
        user_response = supabase.auth.get_user(token)

        if not user_response or not user_response.user:
            raise HTTPException(status_code=401, detail="Invalid or expired token")

        user = user_response.user

        profile = get_user_profile(user.id)
        if not profile:
            profile = create_user_profile(user.id, user.email or "")

        return {
            "id": user.id,
            "email": user.email,
            "full_name": profile.get("full_name", "") if profile else "",
            "company_name": profile.get("company_name", "") if profile else "",
            "plan": profile.get("subscription_plan", "free") if profile else "free",
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Authentication failed: {str(e)}")


def get_optional_user(authorization: str = Header(None)):
    """Get user if authenticated, return None otherwise."""
    if not authorization:
        return None
    try:
        return get_user(authorization)
    except Exception:
        return None

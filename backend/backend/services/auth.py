from fastapi import Header, HTTPException
from backend.services.db import supabase, get_user_profile, create_user_profile

def get_user(authorization: str = Header(...)):
    """Extract and validate user from Authorization header"""
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid authorization header")

    token = authorization.replace("Bearer ", "")
    
    try:
        # Verify token with Supabase
        user_response = supabase.auth.get_user(token)
        
        if not user_response or not user_response.user:
            raise HTTPException(status_code=401, detail="Invalid or expired token")
        
        user = user_response.user
        
        # Check if user profile exists, create if not
        profile = get_user_profile(user.id)
        if not profile:
            profile = create_user_profile(user.id, user.email or "")
        
        return {
            "id": user.id,
            "email": user.email,
            "plan": profile.get("plan", "free") if profile else "free"
        }
        
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Authentication failed: {str(e)}")

def get_optional_user(authorization: str = Header(None)):
    """Get user if authenticated, return None otherwise"""
    if not authorization:
        return None
    try:
        return get_user(authorization)
    except:
        return None

"""
Authentication utilities
"""
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from .database import get_db
from .models import User

security = HTTPBearer()


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
) -> User:
    """
    Get current authenticated user from JWT token
    This is a simplified implementation. In production, you should:
    - Verify JWT token signature
    - Check token expiration
    - Extract user ID from token claims
    """
    # For now, this is a placeholder that returns a mock user
    # In production, decode JWT and fetch user from database
    # Placeholder: In real implementation, decode JWT and get user_id
    # token = credentials.credentials
    # For now, return first user or raise error
    user = db.query(User).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return user

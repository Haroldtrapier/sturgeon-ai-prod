"""
Pydantic schemas for API request/response models
"""
from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from uuid import UUID


class ProposalUpdate(BaseModel):
    """Schema for updating a proposal"""
    title: Optional[str] = None
    body: Optional[str] = None
    status: Optional[str] = None

    class Config:
        from_attributes = True


class ProposalOut(BaseModel):
    """Schema for proposal response"""
    id: int
    user_id: UUID
    opportunity_id: Optional[UUID] = None
    title: str
    body: Optional[str] = None
    version: int
    status: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

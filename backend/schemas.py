"""
Pydantic schemas for request/response validation
"""
from pydantic import BaseModel, field_validator
from typing import Optional, Literal
from datetime import datetime


class UserBase(BaseModel):
    email: str
    full_name: Optional[str] = None


class UserOut(UserBase):
    id: int
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True


class ProposalBase(BaseModel):
    title: str
    body: Optional[str] = None
    status: Optional[str] = "draft"


class ProposalCreate(ProposalBase):
    pass


class ProposalUpdate(BaseModel):
    title: Optional[str] = None
    body: Optional[str] = None
    status: Optional[Literal['draft', 'review', 'submitted', 'accepted', 'rejected']] = None


class ProposalOut(ProposalBase):
    id: int
    owner_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

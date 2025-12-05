"""
SQLAlchemy database models for Sturgeon AI
"""
from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, ForeignKey, JSON
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid

try:
    from database import Base
except ImportError:
    from .database import Base


class User(Base):
    """User model - extends Supabase auth.users"""
    __tablename__ = "user_profiles"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    full_name = Column(String)
    company_name = Column(String)
    phone = Column(String)
    avatar_url = Column(String)
    subscription_plan = Column(String, default='free')
    credits = Column(Integer, default=100)
    total_searches = Column(Integer, default=0)
    total_proposals = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    proposals = relationship("Proposal", back_populates="owner")


class Proposal(Base):
    """Proposal model for generated proposal documents"""
    __tablename__ = "proposals"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("user_profiles.id"))
    opportunity_id = Column(UUID(as_uuid=True))
    title = Column(Text, nullable=False)
    body = Column(Text)  # Adding body field as mentioned in the problem statement
    version = Column(Integer, default=1)
    status = Column(String, default='draft')
    content = Column(JSON, nullable=False, default={})
    executive_summary = Column(Text)
    technical_approach = Column(Text)
    pricing = Column(JSON)
    generated_by_ai = Column(Boolean, default=True)
    ai_provider = Column(String)
    document_url = Column(String)
    submitted_at = Column(DateTime)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    owner = relationship("User", back_populates="proposals")

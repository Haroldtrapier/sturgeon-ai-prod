"""
Database models
"""
from sqlalchemy import Column, String, Text, DateTime, Integer
from sqlalchemy.sql import func
from backend.database import Base


class Proposal(Base):
    """Proposal model for storing proposal data"""
    __tablename__ = "proposals"
    
    id = Column(String, primary_key=True, index=True)
    raw_text = Column(Text, nullable=True)
    generated_text = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())


class CompanyProfile(Base):
    """Company profile model for storing company information"""
    __tablename__ = "company_profiles"
    
    id = Column(String, primary_key=True, index=True)
    name = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    industry = Column(String, nullable=True)
    capabilities = Column(Text, nullable=True)
    past_performance = Column(Text, nullable=True)
    certifications = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

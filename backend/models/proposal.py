"""
Proposal model
"""
from sqlalchemy import Column, String, Text, DateTime
from sqlalchemy.sql import func
from database import Base


class Proposal(Base):
    __tablename__ = "proposals"

    id = Column(String, primary_key=True, index=True)
    raw_text = Column(Text, nullable=True)
    generated_text = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

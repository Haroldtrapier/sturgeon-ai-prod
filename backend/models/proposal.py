"""
Proposal model for Sturgeon AI.
"""
from datetime import datetime
from typing import Optional


class Proposal:
    """
    Placeholder Proposal model.
    In a real implementation, this would be a SQLAlchemy or Pydantic model
    with database mapping.
    """
    def __init__(
        self,
        id: Optional[int] = None,
        title: Optional[str] = None,
        content: Optional[str] = None,
        opportunity_id: Optional[str] = None,
        created_at: Optional[datetime] = None,
        updated_at: Optional[datetime] = None
    ):
        self.id = id
        self.title = title
        self.content = content
        self.opportunity_id = opportunity_id
        self.created_at = created_at or datetime.utcnow()
        self.updated_at = updated_at or datetime.utcnow()
    
    def __repr__(self):
        return f"<Proposal(id={self.id}, title={self.title})>"

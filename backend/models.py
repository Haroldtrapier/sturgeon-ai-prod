"""
SQLAlchemy models for Sturgeon AI database tables.
"""
from sqlalchemy import Column, String, Text, TIMESTAMP, UUID, Integer, Numeric, Boolean, ARRAY, JSON
from sqlalchemy.dialects.postgresql import UUID as PG_UUID
from .database import Base
import uuid


class Opportunity(Base):
    """Government contracting opportunities model."""
    __tablename__ = "opportunities"
    
    id = Column(PG_UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    notice_id = Column(String, unique=True, nullable=False)
    title = Column(Text, nullable=False)
    description = Column(Text)
    agency = Column(Text)
    office = Column(Text)
    naics_code = Column(Text)
    psc_code = Column(Text)
    set_aside = Column(Text)
    place_of_performance = Column(Text)
    posted_date = Column(TIMESTAMP(timezone=True))
    response_deadline = Column(TIMESTAMP(timezone=True))
    contract_value_min = Column(Numeric)
    contract_value_max = Column(Numeric)
    contract_type = Column(Text)
    source = Column(Text, default='SAM.gov')
    url = Column(Text)
    attachments = Column(JSON, default=[])
    keywords = Column(ARRAY(Text))
    status = Column(Text, default='active')
    match_score = Column(Integer)
    last_synced_at = Column(TIMESTAMP(timezone=True))
    created_at = Column(TIMESTAMP(timezone=True))
    updated_at = Column(TIMESTAMP(timezone=True))


class Proposal(Base):
    """Generated proposal documents model."""
    __tablename__ = "proposals"
    
    id = Column(PG_UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(PG_UUID(as_uuid=True))
    opportunity_id = Column(PG_UUID(as_uuid=True))
    title = Column(Text, nullable=False)
    version = Column(Integer, default=1)
    status = Column(Text, default='draft')
    content = Column(JSON, nullable=False)
    executive_summary = Column(Text)
    technical_approach = Column(Text)
    pricing = Column(JSON)
    generated_by_ai = Column(Boolean, default=True)
    ai_provider = Column(Text)
    document_url = Column(Text)
    submitted_at = Column(TIMESTAMP(timezone=True))
    created_at = Column(TIMESTAMP(timezone=True))
    updated_at = Column(TIMESTAMP(timezone=True))
    
    # For embedding rebuild - combining title and body
    @property
    def body(self):
        """Get proposal body from technical_approach or content."""
        if self.technical_approach:
            return self.technical_approach
        # Fallback to content if technical_approach is not set
        if isinstance(self.content, dict):
            return self.content.get('technical_approach', '')
        return ''

"""
Proposal models for managing generated proposals and drafts
"""
import uuid
from sqlalchemy import Column, String, Text, DateTime, func, Integer, Boolean, ForeignKey, Index, Enum
from sqlalchemy.orm import relationship
from database import Base
import enum


class ProposalStatus(str, enum.Enum):
    """Status of a proposal in the workflow"""
    DRAFT = "draft"
    IN_REVIEW = "in_review"
    READY = "ready"
    SUBMITTED = "submitted"
    AWARDED = "awarded"
    REJECTED = "rejected"
    WITHDRAWN = "withdrawn"


class Proposal(Base):
    __tablename__ = "proposals"
    __table_args__ = (
        Index("ix_proposal_user_id", "user_id"),
        Index("ix_proposal_status", "status"),
        Index("ix_proposal_created_at", "created_at"),
    )

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String, nullable=False)
    user_id = Column(String, nullable=False)
    opportunity_id = Column(String, nullable=True)  # Link to opportunity if available

    # Enhanced proposal fields
    status = Column(String(50), default=ProposalStatus.DRAFT.value, nullable=False)
    
    # Content sections
    raw_text = Column(Text, nullable=True)
    generated_text = Column(Text, nullable=True)
    executive_summary = Column(Text, nullable=True)
    technical_approach = Column(Text, nullable=True)
    management_plan = Column(Text, nullable=True)
    past_performance = Column(Text, nullable=True)
    cost_proposal = Column(Text, nullable=True)
    
    # Metadata
    word_count = Column(Integer, default=0)
    confidence_score = Column(Integer, nullable=True)  # AI confidence 0-100
    
    # Timestamps
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    submitted_at = Column(DateTime, nullable=True)


class DocumentUpload(Base):
    """Track uploaded supporting documents"""
    __tablename__ = "document_uploads"
    __table_args__ = (
        Index("ix_document_proposal_id", "proposal_id"),
        Index("ix_document_user_id", "user_id"),
    )

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    proposal_id = Column(String, ForeignKey("proposals.id"), nullable=True)
    user_id = Column(String, nullable=False)
    
    # File metadata
    filename = Column(String(255), nullable=False)
    file_type = Column(String(100), nullable=False)
    file_size = Column(Integer, nullable=False)
    storage_path = Column(String(500), nullable=False)
    
    # Processing
    is_processed = Column(Boolean, default=False)
    extracted_text = Column(Text, nullable=True)
    processing_error = Column(Text, nullable=True)
    
    created_at = Column(DateTime, default=func.now())

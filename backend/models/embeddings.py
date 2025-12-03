from sqlalchemy import Column, String, JSON, DateTime, ForeignKey
from sqlalchemy.sql import func
from database import Base

class EmbeddingRecord(Base):
    __tablename__ = "embeddings"

    id = Column(String, primary_key=True, index=True)
    user_id = Column(String, index=True)
    proposal_id = Column(String, ForeignKey("proposals.id"), nullable=True)
    vector = Column(JSON, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

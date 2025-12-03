"""
Database model for storing embeddings with vector support.
"""
from sqlalchemy import Column, String, DateTime, Integer
from sqlalchemy.sql import func
from pgvector.sqlalchemy import Vector
from backend.database import Base


class EmbeddingRecord(Base):
    """
    Model for storing text embeddings with vector support for similarity search.
    Uses pgvector extension for efficient vector operations in PostgreSQL.
    """
    __tablename__ = "embeddings"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(String, nullable=False, index=True)
    proposal_id = Column(String, nullable=False, index=True)
    vector = Column(Vector(3072), nullable=False)  # text-embedding-3-large has 3072 dimensions
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    def __repr__(self):
        return f"<EmbeddingRecord(id={self.id}, user_id={self.user_id}, proposal_id={self.proposal_id})>"

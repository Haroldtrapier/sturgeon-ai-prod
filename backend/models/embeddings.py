"""
Embedding models for vector search and semantic matching
"""
from sqlalchemy import Column, String, JSON, DateTime, ForeignKey, Text, Integer, Index, Float
from sqlalchemy.sql import func
from sqlalchemy.dialects.postgresql import ARRAY
from database import Base


class EmbeddingRecord(Base):
    """Model for storing Vector embeddings for ContractMatch and other AI services."""
    __tablename__ = "embeddings"
    __table_args__ = (
        Index("ix_embedding_source_type", "source_type"),
        Index("ix_embedding_user_id", "user_id"),
        Index("ix_embedding_created_at", "created_at"),
    )

    id = Column(String, primary_key=True, index=True)
    user_id = Column(String, index=True)
    proposal_id = Column(String, ForeignKey("proposals.id"), nullable=True)
    
    # Enhanced fields for better semantic search
    source_type = Column(String(50), nullable=False, default="proposal")  # 'opportunity', 'proposal', 'document'
    source_id = Column(String(255), nullable=True)  # ID of the source object
    text_content = Column(Text, nullable=True)  # Original text that was embedded
    embedding_model = Column(String(100), nullable=False, default="text-embedding-3-small")
    
    vector = Column(JSON, nullable=False)  # Vector representation
    metadata = Column(JSON, nullable=True)  # Additional metadata
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())


class SemanticSearchCache(Base):
    """Cache semantic search results for performance"""
    __tablename__ = "semantic_search_cache"
    __table_args__ = (
        Index("ix_search_cache_query_hash", "query_hash"),
    )

    id = Column(String, primary_key=True, index=True)
    query_text = Column(Text, nullable=False)
    query_hash = Column(String(64), nullable=False, index=True)
    results = Column(JSON, nullable=False)
    hit_count = Column(Integer, default=0, nullable=False)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    last_accessed = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
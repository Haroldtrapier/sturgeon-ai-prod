"""
Convenience wrapper for embeddings model.
This allows importing from 'models.embeddings' instead of 'backend.models.embeddings'.
"""
from backend.models.embeddings import EmbeddingRecord

__all__ = ["EmbeddingRecord"]

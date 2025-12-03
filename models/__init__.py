"""
Convenience wrapper for models imports.
This allows importing from 'models' instead of 'backend.models'.
"""
from backend.models.embeddings import EmbeddingRecord

__all__ = ["EmbeddingRecord"]

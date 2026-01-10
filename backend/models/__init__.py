# Backend models
from .embeddings import EmbeddingRecord, SemanticSearchCache
from .proposal import Proposal, ProposalStatus, DocumentUpload

__all__ = [
    "EmbeddingRecord",
    "SemanticSearchCache",
    "Proposal",
    "ProposalStatus",
    "DocumentUpload",
]

"""
Tests for embeddings and semantic search
"""
import pytest
from unittest.mock import Mock, patch
from backend.models.embeddings import EmbeddingRecord, SemanticSearchCache
from backend.services.embeddings_ai import embed, store_embedding, semantic_search


@pytest.fixture
def sample_text():
    return "This is a sample government contract opportunity for IT services."


def test_embedding_record_creation():
    """Test creating an embedding record"""
    embedding = EmbeddingRecord(
        id="test-id-123",
        user_id="user-123",
        source_type="opportunity",
        source_id="opp-456",
        text_content="Sample text",
        embedding_model="text-embedding-3-small",
        vector=[0.1, 0.2, 0.3],
        metadata={"category": "IT"}
    )
    
    assert embedding.source_type == "opportunity"
    assert embedding.user_id == "user-123"
    assert len(embedding.vector) == 3


@patch('backend.services.embeddings_ai.openai')
def test_embed_function(mock_openai, sample_text):
    """Test text embedding generation"""
    # Mock OpenAI embedding response
    mock_embedding = [0.1] * 1536  # Typical embedding dimension
    mock_openai.embeddings.create.return_value = Mock(
        data=[Mock(embedding=mock_embedding)]
    )
    
    result = embed(sample_text)
    
    assert len(result) == 1536
    assert all(isinstance(x, float) for x in result)
    mock_openai.embeddings.create.assert_called_once()


def test_search_cache_creation():
    """Test semantic search cache"""
    cache = SemanticSearchCache(
        id="cache-123",
        query_text="IT infrastructure",
        query_hash="abc123def456",
        results='[{"id": "1", "score": 0.9}]',
        hit_count=5
    )
    
    assert cache.query_text == "IT infrastructure"
    assert cache.hit_count == 5


def test_embedding_metadata_storage():
    """Test storing metadata with embeddings"""
    metadata = {
        "contract_type": "IT",
        "agency": "DOD",
        "value": 100000
    }
    
    embedding = EmbeddingRecord(
        id="test-123",
        user_id="user-123",
        source_type="opportunity",
        source_id="opp-789",
        text_content="Sample",
        embedding_model="text-embedding-3-small",
        vector=[0.1, 0.2],
        metadata=metadata
    )
    
    assert embedding.metadata["contract_type"] == "IT"
    assert embedding.metadata["value"] == 100000

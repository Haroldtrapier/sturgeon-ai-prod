"""
Convenience wrapper for embeddings utilities.
This module provides the exact interface shown in the problem statement.
"""
import os
from openai import OpenAI
from database import SessionLocal
from models.embeddings import EmbeddingRecord

# Lazy-initialize OpenAI client
_client = None


def _get_client():
    """Get or create OpenAI client instance."""
    global _client
    if _client is None:
        api_key = os.getenv("OPENAI_API_KEY")
        if not api_key:
            raise ValueError("OPENAI_API_KEY environment variable is not set")
        _client = OpenAI(api_key=api_key)
    return _client


def embed(text: str):
    """
    Generate embeddings for the given text using OpenAI's text-embedding-3-large model.
    
    Args:
        text: The input text to embed
        
    Returns:
        List of floats representing the embedding vector (3072 dimensions)
        
    Raises:
        Exception: If the OpenAI API call fails
    """
    try:
        client = _get_client()
        response = client.embeddings.create(
            model="text-embedding-3-large",
            input=text
        )
        return response.data[0].embedding
    except Exception as e:
        raise Exception(f"Failed to generate embedding: {str(e)}") from e


def store_embedding(user_id: str, proposal_id: str, text: str):
    """
    Generate and store an embedding for the given text in the database.
    
    Args:
        user_id: Identifier for the user
        proposal_id: Identifier for the proposal
        text: The text content to embed and store
        
    Raises:
        Exception: If embedding generation or database storage fails
    """
    vector = embed(text)
    db = SessionLocal()
    try:
        db.add(EmbeddingRecord(
            user_id=user_id,
            proposal_id=proposal_id,
            vector=vector
        ))
        db.commit()
    except Exception as e:
        db.rollback()
        raise Exception(f"Failed to store embedding: {str(e)}") from e
    finally:
        db.close()

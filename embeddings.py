"""
Convenience wrapper for embeddings utilities.
This module provides the exact interface shown in the problem statement.
"""
import openai
import os
from database import SessionLocal
from models.embeddings import EmbeddingRecord

openai.api_key = os.getenv("OPENAI_API_KEY")


def embed(text: str):
    """
    Generate embeddings for the given text using OpenAI's text-embedding-3-large model.
    
    Args:
        text: The input text to embed
        
    Returns:
        List of floats representing the embedding vector (3072 dimensions)
    """
    response = openai.embeddings.create(
        model="text-embedding-3-large",
        input=text
    )
    return response.data[0].embedding


def store_embedding(user_id: str, proposal_id: str, text: str):
    """
    Generate and store an embedding for the given text in the database.
    
    Args:
        user_id: Identifier for the user
        proposal_id: Identifier for the proposal
        text: The text content to embed and store
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
    finally:
        db.close()

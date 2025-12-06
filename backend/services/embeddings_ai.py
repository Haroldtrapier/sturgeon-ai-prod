"""
AI embeddings service for semantic search and matching.
"""
import os
from typing import Optional
from sqlalchemy.orm import Session
from openai import OpenAI

# Initialize OpenAI client lazily to avoid errors on import
_client = None

def get_openai_client():
    """Get or create OpenAI client instance."""
    global _client
    if _client is None:
        _client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
    return _client


def embed_text(
    db: Session,
    entity_type: str,
    entity_id: str,
    text: str,
    model: str = "text-embedding-3-small"
) -> Optional[dict]:
    """
    Generate embeddings for text and store them in the database.
    
    Args:
        db: SQLAlchemy database session
        entity_type: Type of entity ('opportunity', 'proposal', etc.)
        entity_id: ID of the entity
        text: Text to embed
        model: OpenAI embedding model to use
        
    Returns:
        Dictionary with embedding info or None if failed
    """
    try:
        # Generate embedding using OpenAI
        client = get_openai_client()
        response = client.embeddings.create(
            input=text,
            model=model
        )
        
        embedding = response.data[0].embedding
        
        # In a production system, you would store this in a vector database
        # For now, we'll just log that we generated it
        # You could store in pgvector, Pinecone, Weaviate, etc.
        
        result = {
            "entity_type": entity_type,
            "entity_id": entity_id,
            "model": model,
            "embedding_length": len(embedding),
            "success": True
        }
        
        # TODO: Store embedding in vector database
        # Example with pgvector:
        # db.execute(
        #     "INSERT INTO embeddings (entity_type, entity_id, embedding) 
        #      VALUES (:type, :id, :embedding)
        #      ON CONFLICT (entity_type, entity_id) 
        #      DO UPDATE SET embedding = :embedding",
        #     {"type": entity_type, "id": entity_id, "embedding": embedding}
        # )
        # db.commit()
        
        return result
        
    except Exception as e:
        print(f"Error generating embedding for {entity_type}:{entity_id}: {str(e)}")
        return None

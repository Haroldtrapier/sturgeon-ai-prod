"""
OpenAI client service for generating embeddings.
"""
import os
from typing import List
from openai import OpenAI

# Initialize OpenAI client
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))


def get_embedding(text: str, model: str = "text-embedding-3-small") -> List[float]:
    """
    Generate an embedding vector for the given text using OpenAI API.
    
    Args:
        text: The text to embed
        model: The OpenAI embedding model to use (default: text-embedding-3-small)
    
    Returns:
        List of float values representing the embedding vector
    """
    response = client.embeddings.create(
        input=text,
        model=model
    )
    return response.data[0].embedding

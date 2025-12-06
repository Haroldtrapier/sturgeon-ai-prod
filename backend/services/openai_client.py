"""
OpenAI client for generating embeddings
"""
import os
from typing import List
from openai import OpenAI

# Lazy initialization of OpenAI client
_client = None


def _get_client() -> OpenAI:
    """Get or create the OpenAI client instance."""
    global _client
    if _client is None:
        api_key = os.getenv("OPENAI_API_KEY")
        if not api_key:
            raise ValueError(
                "OPENAI_API_KEY environment variable is not set. "
                "Please set it to use the embedding service."
            )
        _client = OpenAI(api_key=api_key)
    return _client


def get_embedding(text: str, model: str = "text-embedding-3-small") -> List[float]:
    """
    Generate an embedding vector for the given text using OpenAI's API.
    
    Args:
        text: The text to embed
        model: The OpenAI embedding model to use (default: text-embedding-3-small)
        
    Returns:
        A list of floats representing the embedding vector
    """
    client = _get_client()
    text = text.replace("\n", " ")
    response = client.embeddings.create(input=[text], model=model)
    return response.data[0].embedding

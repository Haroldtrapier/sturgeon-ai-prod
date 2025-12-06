"""
AgentKit client for streaming AI agent responses using OpenAI
"""
import os
import logging
from typing import AsyncGenerator
from sqlalchemy.orm import Session
from openai import AsyncOpenAI

logger = logging.getLogger(__name__)

# Validate and initialize OpenAI client
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
ENVIRONMENT = os.getenv("ENVIRONMENT", "development")

if not OPENAI_API_KEY:
    if ENVIRONMENT == "production":
        raise ValueError("OPENAI_API_KEY environment variable is required in production")
    logger.warning("OPENAI_API_KEY not set - API calls will fail")

client = AsyncOpenAI(api_key=OPENAI_API_KEY) if OPENAI_API_KEY else None


async def stream_agent_response(
    user: dict,
    message: str,
    db: Session
) -> AsyncGenerator[str, None]:
    """
    Stream agent response tokens using OpenAI's API.
    
    Args:
        user: The current authenticated user
        message: The user's message to the agent
        db: Database session for storing conversation history
    
    Yields:
        str: Individual tokens from the agent's response
    """
    try:
        if not client:
            raise ValueError("OpenAI client not initialized. Please set OPENAI_API_KEY environment variable.")
        
        # Create a streaming chat completion
        response = await client.chat.completions.create(
            model="gpt-4",
            messages=[
                {
                    "role": "system",
                    "content": "You are a helpful AI assistant specialized in government contracting and grants."
                },
                {
                    "role": "user",
                    "content": message
                }
            ],
            stream=True,
            temperature=0.7,
        )
        
        # Stream tokens as they arrive
        async for chunk in response:
            if chunk.choices and len(chunk.choices) > 0:
                delta = chunk.choices[0].delta
                if delta.content:
                    yield delta.content
    
    except Exception as e:
        # Log the actual error for debugging
        logger.error(f"Error in stream_agent_response: {str(e)}", exc_info=True)
        # Yield sanitized error message to client
        yield "An error occurred while processing your request. Please try again later."

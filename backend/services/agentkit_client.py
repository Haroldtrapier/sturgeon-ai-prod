"""
AgentKit client for streaming AI agent responses using OpenAI
"""
import os
from typing import AsyncGenerator
from sqlalchemy.orm import Session
from openai import AsyncOpenAI

# Initialize OpenAI client
client = AsyncOpenAI(api_key=os.getenv("OPENAI_API_KEY"))


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
        # Yield error message as a token
        yield f"Error: {str(e)}"

"""
AgentKit service for Sturgeon AI Agent interactions.
"""

async def run_agent(message: str, user_id: str | None = None) -> str:
    """
    Runs the Sturgeon AI Agent using AgentKit.
    
    Args:
        message: The user's message/query to the agent
        user_id: Optional user identifier for context
        
    Returns:
        The agent's response as a string
    """
    # TODO: Implement actual AgentKit integration
    # For now, return a placeholder response
    response = f"AgentKit received message: '{message}'"
    if user_id:
        response += f" from user: {user_id}"
    
    return response

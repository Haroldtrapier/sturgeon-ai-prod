import os
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, Field
from backend.services.agent_router import route_message
from backend.services.agents_registry import list_agents
from backend.services.auth import get_user, get_optional_user
from backend.services.db import create_conversation, save_message, get_user_conversations, get_conversation_messages
from backend.services.limits import can_chat, can_use_agent, can_save_conversation

router = APIRouter()

class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1)
    agentId: str | None = None
    context: dict | None = None
    conversationId: str | None = None

@router.get("/agents")
def agents():
    """List available agents (public)"""
    return {"agents": list_agents()}

@router.post("/chat")
def chat(req: ChatRequest, user=Depends(get_optional_user)):
    """Send a message to an agent (requires auth for saving)"""
    
    if not os.getenv("OPENAI_API_KEY"):
        raise HTTPException(status_code=500, detail="OPENAI_API_KEY missing.")
    
    # Check limits if user is authenticated
    if user:
        user_plan = user.get("plan", "free")
        user_id = user.get("id")
        
        # Check chat limits
        can_proceed, limit_msg = can_chat(user_id, user_plan)
        if not can_proceed:
            raise HTTPException(status_code=429, detail=limit_msg)
        
        # Check agent access
        if req.agentId:
            can_use, agent_msg = can_use_agent(user_plan, req.agentId)
            if not can_use:
                raise HTTPException(status_code=403, detail=agent_msg)
    
    # Route message to appropriate agent
    result = route_message(req.message, req.agentId, req.context or {})
    
    # Save conversation if user is authenticated
    if user:
        try:
            user_id = user.get("id")
            
            # Create or use existing conversation
            if req.conversationId:
                convo_id = req.conversationId
            else:
                # Check if user can save more conversations
                can_save, save_msg = can_save_conversation(user_id, user.get("plan", "free"))
                if not can_save:
                    # Still allow chat, but don't save
                    result["warning"] = save_msg
                    return result
                
                convo = create_conversation(user_id, f"Chat with {result['agentName']}")
                convo_id = convo["id"] if convo else None
            
            if convo_id:
                # Save user message
                save_message(convo_id, "user", "user", req.message)
                
                # Save assistant response
                save_message(convo_id, "assistant", result["agentId"], result["reply"])
                
                result["conversationId"] = convo_id
        except Exception as e:
            # Don't fail the chat if saving fails
            result["saveError"] = str(e)
    
    return result

@router.get("/conversations")
def list_conversations(user=Depends(get_user)):
    """Get user's conversation history"""
    user_id = user.get("id")
    conversations = get_user_conversations(user_id)
    return {"conversations": conversations}

@router.get("/conversations/{conversation_id}")
def get_conversation(conversation_id: str, user=Depends(get_user)):
    """Get messages in a conversation"""
    messages = get_conversation_messages(conversation_id)
    return {"messages": messages}

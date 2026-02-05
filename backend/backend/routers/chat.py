import os
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from backend.services.agent_router import route_message
from backend.services.agents_registry import list_agents

router = APIRouter()

class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1)
    agentId: str | None = None
    context: dict | None = None

@router.get("/agents")
def agents():
    return {"agents": list_agents()}

@router.post("/chat")
def chat(req: ChatRequest):
    if not os.getenv("OPENAI_API_KEY"):
        raise HTTPException(status_code=500, detail="OPENAI_API_KEY missing.")
    return route_message(req.message, req.agentId, req.context or {})

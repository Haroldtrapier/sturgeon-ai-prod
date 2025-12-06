from fastapi import APIRouter
from pydantic import BaseModel
from services.agent_kit import run_agent

router = APIRouter(prefix="/agent", tags=["AgentKit"])

class AgentRequest(BaseModel):
    message: str
    user_id: str | None = None

@router.post("/ask")
async def ask_agent(payload: AgentRequest):
    """
    Runs your Sturgeon AI Agent using AgentKit.
    """
    response = await run_agent(payload.message, user_id=payload.user_id)
    return {"response": response}

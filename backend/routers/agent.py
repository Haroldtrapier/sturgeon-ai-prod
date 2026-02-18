from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Optional

try:
    from services.agent_kit import run_agent
    from services.auth import get_optional_user
except ImportError:
    from backend.services.agent_kit import run_agent
    from backend.services.auth import get_optional_user

router = APIRouter(prefix="/agent", tags=["AgentKit"])


class AgentRequest(BaseModel):
    message: str
    user_id: Optional[str] = None


@router.post("/ask")
async def ask_agent(payload: AgentRequest, user=Depends(get_optional_user)):
    """
    Run the Sturgeon AI Agent on a question.
    Supports both authenticated and unauthenticated users.
    """
    user_id = payload.user_id or (user.get("id") if user else None)
    try:
        response = await run_agent(payload.message, user_id=user_id)
        return {"response": response, "user_id": user_id}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Agent error: {str(e)}")

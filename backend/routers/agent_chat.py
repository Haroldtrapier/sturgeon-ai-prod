from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from ..database import get_db
from ..auth import get_current_user
from ..services.agentkit_client import stream_agent_response  # you wrap OpenAI AgentKit here

router = APIRouter()

@router.post("/agent/chat")
def agent_chat(
    body: dict,
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    message = body.get("message", "")

    async def event_stream():
        async for token in stream_agent_response(user, message, db):
            yield f"data:{token}\n\n"

    return StreamingResponse(event_stream(), media_type="text/event-stream")

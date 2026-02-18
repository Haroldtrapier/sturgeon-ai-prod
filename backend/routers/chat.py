import json
from datetime import datetime
from fastapi import APIRouter, WebSocket, WebSocketDisconnect

try:
    from services.chatkit import ChatSessionManager
except ImportError:
    from backend.services.chatkit import ChatSessionManager

router = APIRouter(prefix="/chat", tags=["ChatKit"])
manager = ChatSessionManager()


@router.websocket("/ws")
async def websocket_chat(websocket: WebSocket):
    """
    WebSocket endpoint for real-time AI chat.
    Send JSON: {"message": "your question"}
    Receive JSON: {"type": "assistant", "content": "...", "timestamp": "..."}
    """
    await manager.connect(websocket)
    try:
        while True:
            raw = await websocket.receive_text()

            # Parse incoming message
            try:
                data = json.loads(raw)
                text = data.get("message", raw)
            except json.JSONDecodeError:
                text = raw

            # Get AI response
            reply = await manager.handle_message(text, websocket=websocket)

            # Send structured response
            await manager.send_personal_message(
                json.dumps({
                    "type": "assistant",
                    "content": reply,
                    "timestamp": datetime.utcnow().isoformat(),
                }),
                websocket,
            )
    except WebSocketDisconnect:
        manager.disconnect(websocket)

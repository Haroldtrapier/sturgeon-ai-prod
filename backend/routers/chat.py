from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from services.chatkit import ChatSessionManager

router = APIRouter(prefix="/chat", tags=["ChatKit"])
manager = ChatSessionManager()

@router.websocket("/ws")
async def websocket_chat(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            data = await websocket.receive_text()
            reply = await manager.handle_message(data)
            await manager.send_personal_message(reply, websocket)
    except WebSocketDisconnect:
        manager.disconnect(websocket)

"""
ChatKit service for managing WebSocket chat sessions
"""
from typing import List
from fastapi import WebSocket


class ChatSessionManager:
    """Manages WebSocket chat connections and message handling"""
    
    def __init__(self):
        self.active_connections: List[WebSocket] = []
    
    async def connect(self, websocket: WebSocket):
        """Accept and register a new WebSocket connection"""
        await websocket.accept()
        self.active_connections.append(websocket)
    
    def disconnect(self, websocket: WebSocket):
        """Remove a WebSocket connection from active connections"""
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)
    
    async def handle_message(self, message: str) -> str:
        """
        Process incoming message and generate a reply
        
        Args:
            message: The message text received from the client
            
        Returns:
            str: The reply message to send back
        """
        # Simple echo response for now - can be extended with AI integration
        return f"Echo: {message}"
    
    async def send_personal_message(self, message: str, websocket: WebSocket):
        """
        Send a message to a specific WebSocket connection
        
        Args:
            message: The message to send
            websocket: The target WebSocket connection
        """
        await websocket.send_text(message)
    
    async def broadcast(self, message: str):
        """
        Broadcast a message to all active connections
        
        Args:
            message: The message to broadcast
        """
        disconnected = []
        for connection in self.active_connections:
            try:
                await connection.send_text(message)
            except Exception:
                disconnected.append(connection)
        
        # Remove disconnected connections
        for connection in disconnected:
            self.disconnect(connection)

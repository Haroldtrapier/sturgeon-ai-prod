"""
WebSocket chat session manager - handles real-time AI chat connections.
Uses the shared LLM service (Claude preferred, OpenAI fallback).
"""
import json
import asyncio
from typing import Dict, Optional
from datetime import datetime

try:
    from services.llm import allm_chat
    from services.db import supabase
except ImportError:
    from backend.services.llm import allm_chat
    from backend.services.db import supabase


SYSTEM_PROMPT = """You are Sturgeon AI, a government contracting intelligence assistant.
You help small businesses win federal contracts by providing expert guidance on:
- SAM.gov opportunities and registration
- Proposal writing and compliance
- FAR/DFARS regulations
- Certifications (8(a), SDVOSB, HUBZone, WOSB)
- Market intelligence and competitor analysis
- Set-aside requirements and eligibility
- Pricing strategies and past performance

Be concise, specific, and actionable. Reference relevant FAR clauses when applicable.
If you're unsure about something, say so rather than guessing."""


class ChatSessionManager:
    def __init__(self):
        self.active_connections: Dict[int, "WebSocket"] = {}
        self.session_histories: Dict[int, list] = {}

    async def connect(self, websocket, user_id: Optional[str] = None):
        """Accept a WebSocket connection and initialize session."""
        await websocket.accept()
        conn_id = id(websocket)
        self.active_connections[conn_id] = websocket
        self.session_histories[conn_id] = []

        # Send welcome message
        await self.send_personal_message(json.dumps({
            "type": "system",
            "content": "Connected to Sturgeon AI. How can I help with your government contracting needs?",
            "timestamp": datetime.utcnow().isoformat(),
        }), websocket)

    def disconnect(self, websocket):
        """Clean up on disconnect."""
        conn_id = id(websocket)
        self.active_connections.pop(conn_id, None)
        self.session_histories.pop(conn_id, None)

    async def handle_message(self, text: str, websocket=None) -> str:
        """
        Process an incoming chat message and generate an AI response.
        Maintains conversation history for context.
        """
        conn_id = id(websocket) if websocket else 0
        history = self.session_histories.get(conn_id, [])

        # Build conversation context (last 10 exchanges)
        context_messages = []
        for msg in history[-20:]:  # Last 10 user+assistant pairs
            context_messages.append(f"{msg['role'].upper()}: {msg['content']}")

        context_messages.append(f"USER: {text}")
        full_prompt = "\n\n".join(context_messages)

        try:
            response = await allm_chat(
                system_prompt=SYSTEM_PROMPT,
                user_message=full_prompt,
                max_tokens=2048,
            )
        except Exception as e:
            response = f"I'm having trouble processing your request. Please try again. (Error: {str(e)})"

        # Update history
        history.append({"role": "user", "content": text})
        history.append({"role": "assistant", "content": response})
        self.session_histories[conn_id] = history

        return response

    async def send_personal_message(self, message: str, websocket):
        """Send a message to a specific WebSocket connection."""
        try:
            await websocket.send_text(message)
        except Exception:
            self.disconnect(websocket)

    async def broadcast(self, message: str):
        """Broadcast a message to all connected clients."""
        disconnected = []
        for conn_id, ws in self.active_connections.items():
            try:
                await ws.send_text(message)
            except Exception:
                disconnected.append(conn_id)
        for conn_id in disconnected:
            self.active_connections.pop(conn_id, None)
            self.session_histories.pop(conn_id, None)

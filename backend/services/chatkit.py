import openai
import os

openai.api_key = os.getenv("OPENAI_API_KEY")

class ChatSessionManager:
    def __init__(self):
        self.active_connections = {}

    async def connect(self, websocket):
        await websocket.accept()
        self.active_connections[id(websocket)] = websocket

    def disconnect(self, websocket):
        self.active_connections.pop(id(websocket), None)

    async def handle_message(self, text: str) -> str:
        """
        ChatKit simple handler (can support memory & multi-agent later)
        """
        response = openai.chat.completions.create(
            model="gpt-4.1",
            messages=[
                {"role": "system",
                 "content": "You are the Sturgeon AI Chat Assistant."},
                {"role": "user", "content": text}
            ]
        )
        return response.choices[0].message["content"]

    async def send_personal_message(self, message, websocket):
        await websocket.send_text(message)

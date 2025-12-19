from openai import OpenAI
import os

class ChatSessionManager:
    def __init__(self):
        self.active_connections = {}
        api_key = os.getenv("OPENAI_API_KEY")
        # Initialize client with API key if available
        self.client = OpenAI(api_key=api_key) if api_key else None

    async def connect(self, websocket):
        await websocket.accept()
        self.active_connections[id(websocket)] = websocket

    def disconnect(self, websocket):
        self.active_connections.pop(id(websocket), None)

    async def handle_message(self, text: str) -> str:
        """
        ChatKit simple handler (can support memory & multi-agent later)
        """
        if not self.client:
            return "Sorry, OpenAI API key is not configured."
        
        try:
            response = self.client.chat.completions.create(
                model="gpt-4",
                messages=[
                    {"role": "system",
                     "content": "You are the Sturgeon AI Chat Assistant."},
                    {"role": "user", "content": text}
                ]
            )
            if response.choices and len(response.choices) > 0:
                return response.choices[0].message.content
            return "Sorry, I received an empty response from the AI."
        except Exception as e:
            # Return error message to user in case of API failure
            return f"Sorry, I encountered an error: {str(e)}"

    async def send_personal_message(self, message, websocket):
        await websocket.send_text(message)

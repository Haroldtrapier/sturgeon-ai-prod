"""
Sturgeon AI Backend - FastAPI Application

This is a minimal backend template for the Sturgeon AI platform.
Expand this with your custom business logic, AI integrations, and data processing.
"""

from fastapi import FastAPI, HTTPException, Header
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os
from typing import Optional

app = FastAPI(
    title="Sturgeon AI Backend",
    description="AI-powered government contracting intelligence",
    version="1.0.0"
)

# CORS Configuration
allowed_origins = os.getenv("CORS_ORIGINS", "*").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Request/Response Models
class ChatRequest(BaseModel):
    message: str
    context: Optional[dict] = None
    userId: Optional[str] = None

class ChatResponse(BaseModel):
    reply: str
    metadata: Optional[dict] = None

class OpportunityParseRequest(BaseModel):
    text: str
    source: str

# Health Check
@app.get("/health")
def health_check():
    return {
        "ok": True,
        "service": "sturgeon-ai-backend",
        "version": "1.0.0",
        "env": {
            "hasOpenAI": bool(os.getenv("OPENAI_API_KEY")),
            "corsOrigins": allowed_origins,
        }
    }

# AI Chat Endpoint
@app.post("/agent/chat", response_model=ChatResponse)
async def agent_chat(
    payload: ChatRequest,
    authorization: Optional[str] = Header(None)
):
    """
    AI chat endpoint with OpenAI integration.
    """
    
    # Extract user ID from authorization header if needed
    user_id = None
    if authorization and authorization.startswith("Bearer "):
        user_id = authorization.replace("Bearer ", "")
    
    # Try to use OpenAI if API key is available
    openai_key = os.getenv("OPENAI_API_KEY")
    
    if openai_key:
        try:
            from openai import OpenAI
            client = OpenAI(api_key=openai_key)
            
            # Create system message for government contracting expert
            system_message = "You are an expert AI assistant for Sturgeon AI, a government contracting and grants platform. You help users find opportunities, analyze contracts, and generate proposals. Be helpful, concise, and professional."
            
            response = client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {"role": "system", "content": system_message},
                    {"role": "user", "content": payload.message}
                ],
                temperature=0.7,
                max_tokens=500
            )
            
            reply = response.choices[0].message.content
            
            return ChatResponse(
                reply=reply,
                metadata={
                    "userId": user_id,
                    "contextProvided": bool(payload.context),
                    "model": "gpt-4o-mini",
                    "aiPowered": True
                }
            )
            
        except Exception as e:
            # If OpenAI fails, return error message
            return ChatResponse(
                reply=f"I'm having trouble connecting to my AI engine right now. Error: {str(e)[:100]}. Please try again in a moment.",
                metadata={
                    "userId": user_id,
                    "contextProvided": bool(payload.context),
                    "error": str(e),
                    "aiPowered": False
                }
            )
    else:
        # Fallback if no API key
        reply = f"Received your message: '{payload.message}'. AI integration is ready - connect your OpenAI key or custom AI engine."
        
        return ChatResponse(
            reply=reply,
            metadata={
                "userId": user_id,
                "contextProvided": bool(payload.context),
                "aiPowered": False
            }
        )

# Opportunity Parser Endpoint
@app.post("/opportunities/parse")
async def parse_opportunity(
    payload: OpportunityParseRequest,
    authorization: Optional[str] = Header(None)
):
    """
    Parse opportunity text and extract structured data.
    
    TODO: Implement parsing logic:
    - Extract title, agency, due date
    - Identify requirements
    - Parse NAICS codes, PSC codes
    - Extract contact information
    """
    
    # TODO: Replace with real parsing logic
    # Could use:
    # - Regex patterns
    # - NLP libraries (spaCy, NLTK)
    # - LLM-based extraction (GPT-4)
    
    return {
        "parsed": {
            "title": "Extracted Title",
            "agency": "Extracted Agency",
            "source": payload.source,
            "rawText": payload.text[:200] + "...",
            "confidence": 0.85
        },
        "message": "Parsing complete - implement custom extraction logic"
    }

# Run with: uvicorn main:app --reload --port 8000
if __name__ == "__main__":
    import os
    import uvicorn

    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)

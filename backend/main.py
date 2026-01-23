from fastapi import FastAPI, HTTPException, Header
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os
from typing import Optional, Dict, Any

# Import routers
from routers.agent import router as agent_router
from routers.sam import router as sam_router

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

# Include routers
app.include_router(agent_router)
app.include_router(sam_router)

# Request/Response Models
class ChatRequest(BaseModel):
    message: str
    context: Optional[Dict[str, Any]] = None
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
            "hasSAMKey": bool(os.getenv("SAM_GOV_API_KEY")),
            "corsOrigins": allowed_origins,
        }
    }

# AI Chat Endpoint with Specialized Agent Support
@app.post("/agent/chat", response_model=ChatResponse)
async def agent_chat(
    payload: ChatRequest,
    authorization: Optional[str] = Header(None)
):
    """
    AI chat endpoint with support for specialized agents.
    Uses custom system prompts passed from frontend for different agent types.
    """
    
    # Extract user ID from authorization header if needed
    user_id = None
    if authorization and authorization.startswith("Bearer "):
        user_id = authorization.replace("Bearer ", "")
    
    # Extract agent context
    agent_type = payload.context.get('agentType', 'general') if payload.context else 'general'
    system_prompt = payload.context.get('systemPrompt') if payload.context else None
    
    # Default system prompt if none provided
    if not system_prompt:
        system_prompt = "You are a helpful AI assistant for Sturgeon AI, a government contracting platform. Help users with questions about opportunities, proposals, and contracts."
    
    # Try to use OpenAI if API key is available
    openai_key = os.getenv("OPENAI_API_KEY")
    
    if openai_key:
        try:
            from openai import OpenAI
            client = OpenAI(api_key=openai_key)
            
            response = client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": payload.message}
                ],
                temperature=0.7,
                max_tokens=1000
            )
            
            reply = response.choices[0].message.content
            
            return ChatResponse(
                reply=reply,
                metadata={
                    "userId": user_id,
                    "agentType": agent_type,
                    "contextProvided": bool(payload.context),
                    "model": "gpt-4o-mini",
                    "aiPowered": True
                }
            )
            
        except Exception as e:
            # If OpenAI fails, return error message
            return ChatResponse(
                reply=f"I'm having trouble connecting to my AI engine right now. Error: {str(e)[:100]}. Please check your OpenAI API key in Railway environment variables.",
                metadata={
                    "userId": user_id,
                    "agentType": agent_type,
                    "contextProvided": bool(payload.context),
                    "error": str(e),
                    "aiPowered": False
                }
            )
    else:
        # Fallback if no API key
        reply = f"AI Agent ({agent_type}) received: '{payload.message}'. Please add OPENAI_API_KEY to Railway environment variables to enable AI responses."
        
        return ChatResponse(
            reply=reply,
            metadata={
                "userId": user_id,
                "agentType": agent_type,
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
"""
Sturgeon AI Backend - Unified FastAPI Application
Government Contracting Intelligence Platform

All routers, middleware, and background jobs configured here.
"""
import os
from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException, Header
from fastapi.middleware.cors import CORSMiddleware
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from pydantic import BaseModel
from typing import Optional, Dict, Any

# Rate limiter
limiter = Limiter(key_func=get_remote_address)


# ── Lifespan (startup/shutdown) ──────────────────────────────────────

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    print("[Sturgeon AI] Starting backend services...")
    try:
        from jobs.scheduler import start_scheduler
        start_scheduler()
        print("[Sturgeon AI] Background scheduler started")
    except Exception as e:
        print(f"[Sturgeon AI] Scheduler start failed (non-fatal): {e}")
    yield
    # Shutdown
    try:
        from jobs.scheduler import stop_scheduler
        stop_scheduler()
    except Exception:
        pass
    print("[Sturgeon AI] Backend shutting down")


# ── FastAPI App ──────────────────────────────────────────────────────

app = FastAPI(
    title="Sturgeon AI Backend",
    description="AI-powered government contracting intelligence platform",
    version="9.0.0",
    lifespan=lifespan,
)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# ── CORS Configuration ───────────────────────────────────────────────

allowed_origins = os.getenv("CORS_ORIGINS", "*").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Router Registration ──────────────────────────────────────────────

routers_loaded = []
router_configs = [
    ("routers.opportunities", "opportunities"),
    ("routers.profile", "profile"),
    ("routers.compliance", "compliance"),
    ("routers.certifications", "certifications"),
    ("routers.notifications", "notifications"),
    ("routers.market_intelligence", "market_intelligence"),
    ("routers.agents_chat", "agents_chat"),
    ("routers.sam", "sam"),
    ("routers.settings", "settings"),
]

for module_path, name in router_configs:
    try:
        module = __import__(module_path, fromlist=["router"])
        app.include_router(module.router)
        routers_loaded.append(name)
    except Exception as e:
        print(f"[Sturgeon AI] Failed to load {name} router: {e}")

# Load additional routers (Phase 4-8)
extra_routers = [
    ("routers.chat", "chat"),
    ("routers.agent", "agent"),
    ("routers.export", "export"),
    ("routers.review", "review"),
    ("routers.submission", "submission"),
    ("routers.billing", "billing"),
    ("routers.admin", "admin"),
    ("routers.onboarding", "onboarding"),
    ("routers.support", "support"),
    ("routers.research", "research"),
    ("routers.marketplaces", "marketplaces"),
    ("routers.stripe_webhook", "stripe_webhook"),
]

for module_path, name in extra_routers:
    try:
        module = __import__(module_path, fromlist=["router"])
        app.include_router(module.router)
        routers_loaded.append(name)
    except Exception as e:
        print(f"[Sturgeon AI] Failed to load {name} router (non-critical): {e}")


# ── Health Check ─────────────────────────────────────────────────────

@app.get("/health")
def health_check():
    return {
        "ok": True,
        "service": "sturgeon-ai-backend",
        "version": "9.0.0",
        "status": "healthy",
        "routers_loaded": routers_loaded,
        "routers_count": len(routers_loaded),
        "env": {
            "hasAnthropicKey": bool(os.getenv("ANTHROPIC_API_KEY")),
            "hasOpenAIKey": bool(os.getenv("OPENAI_API_KEY")),
            "hasSAMKey": bool(os.getenv("SAM_GOV_API_KEY")),
            "hasSupabaseUrl": bool(os.getenv("SUPABASE_URL")),
            "corsOrigins": allowed_origins,
        },
    }


@app.get("/")
def root():
    return {
        "service": "Sturgeon AI API",
        "version": "9.0.0",
        "status": "operational",
        "docs": "/docs",
        "health": "/health",
        "features": [
            "6 Specialized AI Agents (Research, Opportunity, Compliance, Proposal, Market, General)",
            "SAM.gov Opportunity Search & Import",
            "Opportunity Matching & Scoring",
            "Proposal Generation & Compliance Matrix",
            "Market Intelligence (FPDS, USASpending)",
            "Certification Management",
            "Multi-agent Chat with Session History",
            "Background Job Scheduling",
            "DOCX/PDF Export",
            "Stripe Billing Integration",
            "Notification System",
        ],
    }


# ── Legacy Agent Chat Endpoint (backward compatibility) ───────────────

class ChatRequest(BaseModel):
    message: str
    context: Optional[Dict[str, Any]] = None
    userId: Optional[str] = None


class ChatResponse(BaseModel):
    reply: str
    metadata: Optional[dict] = None


@app.post("/agent/chat", response_model=ChatResponse)
async def legacy_agent_chat(
    payload: ChatRequest,
    authorization: Optional[str] = Header(None),
):
    """Legacy agent chat endpoint for backward compatibility with frontend."""
    agent_type = payload.context.get("agentType", "general") if payload.context else "general"

    # Map frontend agent types to backend agent types
    agent_map = {
        "contract_research": "research",
        "proposal_writer": "proposal",
        "compliance_checker": "compliance",
        "capture_strategy": "research",
        "certifications": "general",
        "general_assistant": "general",
        "general": "general",
        "research": "research",
        "opportunity": "opportunity",
        "compliance": "compliance",
        "proposal": "proposal",
        "market": "market",
    }
    mapped_type = agent_map.get(agent_type, "general")

    try:
        from agents import get_agent
        agent = get_agent(mapped_type)
        reply = await agent.chat(message=payload.message)

        return ChatResponse(
            reply=reply,
            metadata={
                "agentType": mapped_type,
                "agentName": agent.name,
                "aiPowered": True,
            },
        )
    except Exception as e:
        return ChatResponse(
            reply=f"I'm having trouble processing your request: {str(e)[:200]}. Please check that AI API keys are configured.",
            metadata={
                "agentType": mapped_type,
                "aiPowered": False,
                "error": str(e)[:100],
            },
        )


# ── Opportunity Parser (backward compat) ─────────────────────────────

class OpportunityParseRequest(BaseModel):
    text: str
    source: str


@app.post("/opportunities/parse")
async def parse_opportunity(payload: OpportunityParseRequest):
    """Parse opportunity text using AI."""
    try:
        from services.llm import llm_chat
        result = llm_chat(
            "You are an expert at parsing government contracting opportunities. Extract structured data.",
            f"Parse this opportunity from {payload.source}:\n\n{payload.text[:5000]}\n\nExtract: title, agency, NAICS code, due date, set-aside type, estimated value, and key requirements. Return as JSON.",
        )
        return {"parsed": result, "source": payload.source, "confidence": 0.85}
    except Exception as e:
        return {"parsed": None, "error": str(e), "source": payload.source}


# ── Run Server ────────────────────────────────────────────────────────

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)

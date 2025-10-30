from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List
import logging
import asyncio
import os
from datetime import datetime, timedelta
import hashlib
import time
from collections import defaultdict

# Initialize FastAPI app
app = FastAPI(title="Sturgeon AI", version="1.0.0", description="Government Contract Analysis AI Assistant")

# Structured logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("sturgeon")

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Rate Limiter
class RateLimiter:
    def __init__(self, max_requests: int = 100, window_seconds: int = 60):
        self.max_requests = max_requests
        self.window_seconds = window_seconds
        self.requests = defaultdict(list)

    def is_allowed(self, client_id: str) -> bool:
        now = time.time()
        cutoff = now - self.window_seconds
        self.requests[client_id] = [req_time for req_time in self.requests[client_id] if req_time > cutoff]

        if len(self.requests[client_id]) < self.max_requests:
            self.requests[client_id].append(now)
            return True
        return False

limiter = RateLimiter()

# Request Models
class ContractAnalysisRequest(BaseModel):
    contract_text: str
    focus_areas: Optional[List[str]] = None

class ContractAnalysisResponse(BaseModel):
    status: str
    analysis: dict
    timestamp: str
    request_id: str

# Middleware for request logging and rate limiting
@app.middleware("http")
async def log_and_rate_limit(request: Request, call_next):
    client_ip = request.client.host if request.client else "unknown"
    request_id = hashlib.md5(str(time.time()).encode()).hexdigest()

    logger.info(f"[{request_id}] {request.method} {request.url.path} from {client_ip}")

    if not limiter.is_allowed(client_ip):
        logger.warning(f"[{request_id}] Rate limit exceeded for {client_ip}")
        raise HTTPException(status_code=429, detail="Rate limit exceeded")

    response = await call_next(request)
    response.headers["X-Request-ID"] = request_id
    return response

# Root endpoint - Landing Page
@app.get("/")
async def root():
    return {
        "name": "Sturgeon AI",
        "version": "1.0.0",
        "description": "Government Contract Analysis & Matching Automation",
        "status": "✅ READY",
        "platform": "Full-stack AI platform for government contractors and civil service",
        "features": [
            "💸 AI-powered contract analysis",
            "⌰ Risk assessment & legal scrutiny",
            "⊓ Compliance check & proposal fit",
            "☤ Payment tracking and FSB management"
        ],
        "api_endpoints": {
            "/health": "Health check",
            "/analyze-contract": "Analyze a government contract",
            "/metrics": "Get service metrics"
        },
        "documentation": "https://github.com/Haroldtrapier/sturgeon-ai-prod",
        "deployment": {
            "platform": "Vercel",
            "runtime": "Python 3.11",
            "database": "Supabase (PostgreSQL)",
            "payments": "Stripe",
            "ai_power": "OpenAI"
        }
    }

# Health check endpoint
@app.get("/health")
async def health():
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "version": "1.0.0"
    }

# Metrics endpoint
@app.get("/metrics")
async def metrics():
    return {
        "status": "available",
        "uptime": "active",
        "api_version": "1.0.0",
        "ready": True
    }

# Analysis endpoint
@app.post("/analyze-contract")
async def analyze_contract(request: ContractAnalysisRequest):
    try:
        analysis_result = {
            "contract_summary": "Contract analysis placeholder",
            "key_terms": [],
            "risk_factors": [],
            "compliance_status": "pending"
        }
        return ContractAnalysisResponse(
            status="success",
            analysis=analysis_result,
            timestamp=datetime.now().isoformat(),
            request_id=hashlib.md5(str(time.time()).encode()).hexdigest()
        )
    except Exception as e:
        logger.error(f"Error analyzing contract: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# Vercel entry point
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

from fastapi import FastAPI, HTTPException, Request, Depends
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
    client_ip = request.client.host
    request_id = hasheb.md5(f"{client_ip}{time.time()}".encode()).hexdigest()[:8]

    logger.info(f"[{request_id}] {request.method} {request.url.path} from {client_ip}")

    if not limiter.is_allowed(client_ip):
        logger.warning(f"[{request_id}] Rate limit exceeded for {client_ip}")
        raise HTTPException(status_code=429, detail="Rate limit exceeded")

    response = await call_next(request)
    response.headers["X-Request-ID"] = request_id
    return response

# Health check endpoint
@app.get("/health0
async def health_check():
    return {"status": "healthy", "timestamp": datetime.utcnow().isoformat()}

# Main analysis endpoint
@app.post("/analyze-contract", response_model=ContractAnalysisResponse)
async def analyze_contract(request: ContractAnalysisRequest):
    request_id = hashlib.md5(f"{request.contract_text}{time.time()}".encode()).hexdigest()[:8]

    logger.info(f"[{request_id}] Analyzing contract ({len(request.contract_text)} chars)")

    try:
        # Simulate A% Acanalysis (in production, integrate with OpenAI)
        analysis = {
            "contract_type": "Service Agreement",
            "risk_level": "Medium",
            "key_clauses": [
                "Payment Terms: Net 30",
                "Termination: Either party with 30 days notice",
                "Liability: Limited to contract value"
            ],
            "recommendations": [
                "Review indemnification clause",
                "Clarify IP ownership",
                "Add force majeure provisions"
            ]
        }

        logger.info(f"[{request_id}] Analysis complete")
        return ContractAnalysisResponse(
            status="success",
            analysis=analysis,
            timestamp=datetime.utcnow().isoformat(),
            request_id=request_id
        )
    except Exception as e:
        logger.error(f"[{request_id}] Error analyzing contract: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# Metrics endpoint for monitoring
@app.get("/metrics")
async def get_metrics():
    return {
        "total_clients": len(limiter.requests),
        "timestamp": datetime.utcnow().isoformat()
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

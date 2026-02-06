from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from backend.routers import (
    chat,
    billing,
    proposals,
    export,
    review,
    submission,
    stripe_webhook,
    admin,
    onboarding
)

# Rate limiter
limiter = Limiter(key_func=get_remote_address)

app = FastAPI(title="Sturgeon AI API", version="8.0.0")
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Update with your Vercel domain in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(chat.router)
app.include_router(billing.router)
app.include_router(proposals.router)
app.include_router(export.router)
app.include_router(review.router)
app.include_router(submission.router)
app.include_router(stripe_webhook.router)
app.include_router(admin.router)
app.include_router(onboarding.router)

@app.get("/")
def root():
    return {
        "service": "Sturgeon AI API",
        "version": "8.0.0",
        "status": "operational",
        "phase": "operations_hardening",
        "features": [
            "Multi-agent chat (6 agents)",
            "Opportunity intelligence",
            "Proposal generator + compliance matrix",
            "DOCX/ZIP export",
            "Human review workflow",
            "Teams + roles + audit logging",
            "FedRAMP-aligned security",
            "Submission readiness scoring",
            "Background job queue (Redis + RQ)",
            "Stripe webhook integration",
            "Admin ops dashboard",
            "User onboarding workflow"
        ]
    }

@app.get("/health")
def health():
    return {
        "status": "healthy",
        "version": "8.0.0",
        "operational": True
    }

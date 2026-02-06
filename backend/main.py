from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.routers import chat, billing, proposals, export, review, submission

app = FastAPI(title="Sturgeon AI API", version="7.0.0")

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

@app.get("/")
def root():
    return {
        "service": "Sturgeon AI API",
        "version": "7.0.0",
        "status": "operational",
        "launch_status": "pre-production",
        "features": [
            "Multi-agent chat (6 agents)",
            "Opportunity intelligence",
            "Proposal generator + compliance matrix",
            "DOCX/ZIP export",
            "Human review workflow",
            "Teams + roles + audit logging",
            "FedRAMP-aligned security",
            "Submission readiness scoring"
        ]
    }

@app.get("/health")
def health():
    return {"status": "healthy", "launch_ready": "pending_checklist"}
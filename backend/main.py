from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.routers import chat, billing, proposals

app = FastAPI(title="Sturgeon AI API", version="4.0.0")

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
app.include_router(proposals.router)  # Phase 4: Proposals & Compliance

@app.get("/")
def root():
    return {
        "service": "Sturgeon AI API",
        "version": "4.0.0",
        "status": "operational",
        "features": [
            "Multi-agent chat (6 agents)",
            "Opportunity intelligence",
            "Stripe billing integration",
            "Proposal generator + compliance matrix"  # Phase 4
        ]
    }

@app.get("/health")
def health():
    return {"status": "healthy"}
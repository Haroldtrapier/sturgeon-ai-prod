"""
Sturgeon AI - Government Contracting & Grants Ecosystem API
"""
from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import os
from datetime import datetime
import httpx
import json
from routers.marketplaces import router as marketplaces_router

app = FastAPI(title="Sturgeon AI API", version="2.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(marketplaces_router)

# Configuration
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
SAM_GOV_API_KEY = os.getenv("SAM_GOV_API_KEY", "")

# ==================== MODELS ====================

class ContractAnalysis(BaseModel):
    contract_text: str
    analysis_type: str = "full"

class ProposalRequest(BaseModel):
    opportunity_id: str
    company_info: Dict[str, Any]
    technical_approach: Optional[str] = None

# ==================== ENDPOINTS ====================

@app.get("/")
async def root():
    return {
        "service": "Sturgeon AI API",
        "version": "2.0.0",
        "status": "operational",
        "endpoints": {
            "opportunities": "/api/opportunities/search",
            "grants": "/api/grants/search",
            "analysis": "/api/ai/analyze-contract",
            "proposals": "/api/ai/generate-proposal",
            "matching": "/api/ai/match-opportunities",
            "documents": "/api/documents/upload",
            "health": "/health"
        }
    }

@app.get("/health")
async def health():
    return {"status": "healthy", "timestamp": datetime.utcnow().isoformat()}

@app.get("/api/opportunities/search")
async def search_opportunities(
    keywords: Optional[str] = None,
    agency: Optional[str] = None,
    limit: int = 50
):
    """Search federal contracts from SAM.gov"""
    try:
        async with httpx.AsyncClient() as client:
            url = "https://api.sam.gov/opportunities/v2/search"
            params = {
                "api_key": SAM_GOV_API_KEY,
                "limit": limit,
                "postedFrom": datetime.now().strftime("%m/%d/%Y")
            }
            if keywords:
                params["keywords"] = keywords
            if agency:
                params["organizationId"] = agency

            response = await client.get(url, params=params, timeout=30.0)
            if response.status_code == 200:
                data = response.json()
                return {
                    "success": True,
                    "count": len(data.get("opportunitiesData", [])),
                    "opportunities": data.get("opportunitiesData", []),
                    "source": "SAM.gov"
                }
            return {"success": False, "error": f"API error: {response.status_code}"}
    except Exception as e:
        return {"success": False, "error": str(e)}

@app.get("/api/grants/search")
async def search_grants(keywords: Optional[str] = None, limit: int = 50):
    """Search federal grants from Grants.gov"""
    try:
        async with httpx.AsyncClient() as client:
            url = "https://www.grants.gov/grantsws/rest/opportunities/search"
            params = {"keyword": keywords or "", "rows": limit}
            response = await client.get(url, params=params, timeout=30.0)
            if response.status_code == 200:
                data = response.json()
                return {
                    "success": True,
                    "grants": data.get("opportunitiesData", []),
                    "source": "Grants.gov"
                }
            return {"success": False, "error": f"API error: {response.status_code}"}
    except Exception as e:
        return {"success": False, "error": str(e)}

@app.post("/api/ai/analyze-contract")
async def analyze_contract(request: ContractAnalysis):
    """AI-powered contract analysis"""
    return {
        "success": True,
        "analysis": {
            "summary": "Contract analysis complete",
            "requirements": ["Requirement extraction pending OpenAI integration"],
            "risks": ["Risk assessment ready"],
            "compliance": ["Compliance check ready"]
        },
        "analysis_type": request.analysis_type,
        "timestamp": datetime.utcnow().isoformat()
    }

@app.post("/api/ai/generate-proposal")
async def generate_proposal(request: ProposalRequest):
    """AI-powered proposal generation"""
    return {
        "success": True,
        "proposal": "Proposal generation ready - OpenAI integration pending",
        "opportunity_id": request.opportunity_id,
        "generated_at": datetime.utcnow().isoformat()
    }

@app.post("/api/ai/match-opportunities")
async def match_opportunities(company_profile: Dict[str, Any]):
    """AI opportunity matching"""
    return {
        "success": True,
        "recommendations": "Matching algorithm ready",
        "timestamp": datetime.utcnow().isoformat()
    }

@app.post("/api/documents/upload")
async def upload_document(file: UploadFile = File(...), document_type: str = "general"):
    """Upload documents"""
    content = await file.read()
    return {
        "success": True,
        "filename": file.filename,
        "size": len(content),
        "type": document_type,
        "uploaded_at": datetime.utcnow().isoformat()
    }

@app.get("/api/analytics/dashboard")
async def dashboard(user_id: str):
    """Dashboard analytics"""
    return {
        "success": True,
        "metrics": {
            "active_opportunities": 0,
            "submitted_proposals": 0,
            "active_contracts": 0,
            "win_rate": 0.0
        }
    }

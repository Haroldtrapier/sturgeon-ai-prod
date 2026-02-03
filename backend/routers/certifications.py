from fastapi import APIRouter, HTTPException, UploadFile, File
from pydantic import BaseModel
from typing import List, Optional
from datetime import date

router = APIRouter(prefix="/api/certifications", tags=["certifications"])

class Certification(BaseModel):
    id: str
    name: str
    type: str
    status: str
    issue_date: Optional[date] = None
    expiry_date: Optional[date] = None
    certifying_agency: str

@router.get("")
async def list_certifications(user_id: Optional[str] = None):
    """List all certifications for user"""
    return {
        "certifications": [
            {
                "id": "cert_1",
                "name": "Service-Disabled Veteran-Owned Small Business (SDVOSB)",
                "type": "set_aside",
                "status": "active",
                "certifying_agency": "SBA",
                "expiry_date": "2026-12-31"
            },
            {
                "id": "cert_2",
                "name": "SAM.gov Registration",
                "type": "registration",
                "status": "active",
                "certifying_agency": "GSA",
                "expiry_date": "2026-06-30"
            }
        ],
        "total": 2
    }

@router.get("/{cert_id}")
async def get_certification(cert_id: str):
    """Get certification details"""
    return {
        "id": cert_id,
        "name": "SDVOSB Certification",
        "details": "Full certification details",
        "documents": [],
        "renewal_status": "current"
    }

@router.post("/apply")
async def apply_for_certification(
    cert_type: str,
    documents: List[UploadFile] = File(None)
):
    """Apply for a new certification"""
    return {
        "application_id": "app_123",
        "cert_type": cert_type,
        "status": "submitted",
        "documents_uploaded": len(documents) if documents else 0,
        "message": "Application submitted successfully"
    }

@router.post("/{cert_id}/renew")
async def renew_certification(cert_id: str):
    """Renew an existing certification"""
    return {
        "cert_id": cert_id,
        "renewal_submitted": True,
        "new_expiry": "2027-12-31"
    }

@router.get("/available")
async def list_available_certifications():
    """List all available certifications user can apply for"""
    return {
        "available": [
            {"type": "SDVOSB", "name": "Service-Disabled Veteran-Owned Small Business"},
            {"type": "8a", "name": "8(a) Business Development"},
            {"type": "HUBZone", "name": "Historically Underutilized Business Zone"},
            {"type": "WOSB", "name": "Women-Owned Small Business"}
        ]
    }

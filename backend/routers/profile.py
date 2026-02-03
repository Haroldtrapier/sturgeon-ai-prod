from fastapi import APIRouter, HTTPException, UploadFile, File
from pydantic import BaseModel
from typing import List, Optional

router = APIRouter(prefix="/api/profile", tags=["profile"])

class UserProfile(BaseModel):
    id: str
    company_name: str
    duns_number: Optional[str] = None
    cage_code: Optional[str] = None
    naics_codes: List[str] = []
    certifications: List[str] = []
    past_performance: Optional[dict] = None

class Capability(BaseModel):
    name: str
    description: str
    naics_codes: List[str]
    keywords: List[str]

@router.get("")
async def get_profile(user_id: Optional[str] = None):
    """Get user profile"""
    return {
        "id": "user_123",
        "company_name": "Sample Company LLC",
        "duns_number": "123456789",
        "cage_code": "ABC12",
        "naics_codes": ["541512", "541330"],
        "certifications": ["SDVOSB", "SAM Registered"],
        "contact": {
            "email": "contact@company.com",
            "phone": "(555) 123-4567",
            "address": "123 Main St, City, State 12345"
        },
        "capabilities": []
    }

@router.put("")
async def update_profile(profile: UserProfile):
    """Update user profile"""
    return {
        "updated": True,
        "profile": profile
    }

@router.post("/capabilities")
async def add_capability(capability: Capability):
    """Add a capability to profile"""
    return {
        "added": True,
        "capability": capability
    }

@router.delete("/capabilities/{capability_id}")
async def remove_capability(capability_id: str):
    """Remove a capability from profile"""
    return {
        "removed": True,
        "capability_id": capability_id
    }

@router.post("/documents")
async def upload_document(
    file: UploadFile = File(...),
    document_type: str = "capability_statement"
):
    """Upload profile documents"""
    return {
        "uploaded": True,
        "filename": file.filename,
        "type": document_type,
        "size": file.size if hasattr(file, 'size') else 0
    }

@router.get("/past-performance")
async def get_past_performance(user_id: Optional[str] = None):
    """Get past performance records"""
    return {
        "contracts": [],
        "total_value": 0,
        "customer_ratings": [],
        "message": "Load past performance from database"
    }

"""
Certification Management Router - Track, manage, and guide certifications.
"""
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
from services.auth import get_user
from services.db import get_certifications, create_certification, update_certification

router = APIRouter(prefix="/api/certifications", tags=["certifications"])


class CertificationCreateRequest(BaseModel):
    cert_type: str
    status: str = "pending"
    file_url: Optional[str] = None
    expiration_date: Optional[str] = None
    notes: Optional[str] = None


class CertificationUpdateRequest(BaseModel):
    status: Optional[str] = None
    file_url: Optional[str] = None
    expiration_date: Optional[str] = None
    notes: Optional[str] = None


CERTIFICATION_TYPES = {
    "SDVOSB": {
        "name": "Service-Disabled Veteran-Owned Small Business",
        "certifying_agency": "SBA / VA CVE",
        "description": "For businesses owned and controlled by service-disabled veterans.",
        "requirements": [
            "51% or more owned by one or more service-disabled veterans",
            "Management and daily operations controlled by service-disabled veterans",
            "Service-connected disability verified by VA",
            "Registered in SAM.gov",
            "Meet SBA small business size standards",
        ],
    },
    "8a": {
        "name": "8(a) Business Development Program",
        "certifying_agency": "SBA",
        "description": "Nine-year program for small disadvantaged businesses.",
        "requirements": [
            "Unconditionally owned by US citizens who are socially and economically disadvantaged",
            "Business must be a small business per SBA standards",
            "Owner's personal net worth must be less than $850,000",
            "Demonstrate potential for success",
        ],
    },
    "HUBZone": {
        "name": "Historically Underutilized Business Zone",
        "certifying_agency": "SBA",
        "description": "For businesses in designated HUBZone areas.",
        "requirements": [
            "Principal office must be in a HUBZone",
            "At least 35% of employees must reside in a HUBZone",
            "Small business per SBA standards",
            "Owned by US citizens",
        ],
    },
    "WOSB": {
        "name": "Women-Owned Small Business",
        "certifying_agency": "SBA",
        "description": "For businesses owned and controlled by women.",
        "requirements": [
            "51% or more owned by one or more women",
            "Management and daily operations controlled by one or more women",
            "Women owners must be US citizens",
            "Meet SBA small business size standards",
        ],
    },
    "EDWOSB": {
        "name": "Economically Disadvantaged Women-Owned Small Business",
        "certifying_agency": "SBA",
        "description": "For women-owned businesses that are also economically disadvantaged.",
        "requirements": [
            "Meet all WOSB requirements",
            "Women owners must be economically disadvantaged",
            "Personal net worth less than $850,000",
        ],
    },
    "MBE": {
        "name": "Minority Business Enterprise",
        "certifying_agency": "NMSDC",
        "description": "For businesses owned by ethnic minorities.",
        "requirements": [
            "51% owned by ethnic minority individuals",
            "Management and operations controlled by minority owners",
        ],
    },
}


@router.get("")
async def list_certifications(user=Depends(get_user)):
    """List all user certifications."""
    certs = get_certifications(user["id"])

    enriched = []
    for cert in certs:
        cert_info = CERTIFICATION_TYPES.get(cert.get("cert_type"), {})
        cert["type_name"] = cert_info.get("name", cert.get("cert_type", "Unknown"))
        cert["certifying_agency"] = cert_info.get("certifying_agency", "")

        if cert.get("expiration_date"):
            try:
                exp = datetime.fromisoformat(str(cert["expiration_date"]))
                days_until = (exp - datetime.utcnow()).days
                cert["days_until_expiry"] = days_until
                cert["expiring_soon"] = 0 < days_until <= 90
                cert["expired"] = days_until < 0
            except (ValueError, TypeError):
                pass

        enriched.append(cert)

    return {
        "certifications": enriched,
        "total": len(enriched),
        "active": len([c for c in enriched if c.get("status") == "active"]),
    }


@router.get("/{cert_id}")
async def get_certification(cert_id: str, user=Depends(get_user)):
    """Get certification details."""
    certs = get_certifications(user["id"])
    cert = next((c for c in certs if c.get("id") == cert_id), None)
    if not cert:
        raise HTTPException(status_code=404, detail="Certification not found")

    cert_info = CERTIFICATION_TYPES.get(cert.get("cert_type"), {})
    cert["type_info"] = cert_info
    return cert


@router.post("")
async def add_certification(
    request: CertificationCreateRequest,
    user=Depends(get_user),
):
    """Add a new certification."""
    data = {
        "user_id": user["id"],
        "cert_type": request.cert_type,
        "status": request.status,
        "file_url": request.file_url,
        "expiration_date": request.expiration_date,
        "notes": request.notes,
    }
    result = create_certification(data)
    return {"created": True, "certification": result}


@router.put("/{cert_id}")
async def update_cert(
    cert_id: str,
    request: CertificationUpdateRequest,
    user=Depends(get_user),
):
    """Update a certification."""
    updates = request.model_dump(exclude_none=True)
    if not updates:
        raise HTTPException(status_code=400, detail="No updates provided")

    result = update_certification(cert_id, updates)
    return {"updated": True, "certification": result}


@router.get("/available/types")
async def list_available_certifications():
    """List all available certification types with requirements."""
    return {
        "certification_types": [
            {"type": key, "name": info["name"], "certifying_agency": info["certifying_agency"],
             "description": info["description"], "requirements": info["requirements"]}
            for key, info in CERTIFICATION_TYPES.items()
        ]
    }


@router.get("/requirements/{cert_type}")
async def get_certification_requirements(cert_type: str):
    """Get detailed requirements for a specific certification type."""
    cert_info = CERTIFICATION_TYPES.get(cert_type)
    if not cert_info:
        raise HTTPException(status_code=404, detail=f"Unknown certification type: {cert_type}")
    return {"type": cert_type, **cert_info}


@router.post("/{cert_id}/renew")
async def renew_certification(cert_id: str, user=Depends(get_user)):
    """Initiate certification renewal."""
    certs = get_certifications(user["id"])
    cert = next((c for c in certs if c.get("id") == cert_id), None)
    if not cert:
        raise HTTPException(status_code=404, detail="Certification not found")

    update_certification(cert_id, {"status": "renewal_pending"})
    return {"cert_id": cert_id, "renewal_initiated": True, "status": "renewal_pending"}

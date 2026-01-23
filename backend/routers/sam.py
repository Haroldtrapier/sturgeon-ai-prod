import os
import httpx
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, List, Dict, Any

router = APIRouter(prefix="/sam", tags=["SAM.gov"])

SAM_API_BASE = "https://api.sam.gov/opportunities/v2/search"
SAM_API_KEY = os.getenv("SAM_GOV_API_KEY")

class SAMSearchRequest(BaseModel):
    keywords: str
    limit: Optional[int] = 10
    postedFrom: Optional[str] = None  # Format: MM/DD/YYYY
    postedTo: Optional[str] = None
    responseDeadlineFrom: Optional[str] = None
    responseDeadlineTo: Optional[str] = None
    noticeType: Optional[str] = None  # e.g., "o,p,k" for solicitation types
    organizationId: Optional[str] = None  # NAICS code

class SAMOpportunity(BaseModel):
    noticeId: str
    title: str
    solicitationNumber: Optional[str] = None
    department: Optional[str] = None
    subTier: Optional[str] = None
    office: Optional[str] = None
    postedDate: Optional[str] = None
    responseDeadLine: Optional[str] = None
    naicsCode: Optional[str] = None
    classificationCode: Optional[str] = None
    active: Optional[str] = None
    award: Optional[Dict[str, Any]] = None
    pointOfContact: Optional[List[Dict[str, Any]]] = None
    description: Optional[str] = None
    organizationId: Optional[str] = None
    officeAddress: Optional[Dict[str, Any]] = None
    resourceLinks: Optional[List[str]] = None

@router.post("/search")
async def search_sam_opportunities(request: SAMSearchRequest):
    """
    Search SAM.gov for contract opportunities.
    
    This endpoint queries the official SAM.gov API and returns
    relevant government contracting opportunities based on keywords.
    """
    
    if not SAM_API_KEY:
        raise HTTPException(
            status_code=500,
            detail="SAM_GOV_API_KEY not configured. Please add it to environment variables."
        )
    
    # Build query parameters
    params = {
        "api_key": SAM_API_KEY,
        "q": request.keywords,
        "limit": request.limit,
        "offset": 0,
    }
    
    # Add optional filters if provided
    if request.postedFrom:
        params["postedFrom"] = request.postedFrom
    if request.postedTo:
        params["postedTo"] = request.postedTo
    if request.responseDeadlineFrom:
        params["responseDeadlineFrom"] = request.responseDeadlineFrom
    if request.responseDeadlineTo:
        params["responseDeadlineTo"] = request.responseDeadlineTo
    if request.noticeType:
        params["noticeType"] = request.noticeType
    if request.organizationId:
        params["organizationId"] = request.organizationId
    
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.get(SAM_API_BASE, params=params)
            
            if response.status_code != 200:
                raise HTTPException(
                    status_code=response.status_code,
                    detail=f"SAM.gov API error: {response.text}"
                )
            
            data = response.json()
            
            # Extract opportunities from response
            opportunities = data.get("opportunitiesData", [])
            total_records = data.get("totalRecords", 0)
            
            # Format response
            results = []
            for opp in opportunities:
                results.append({
                    "noticeId": opp.get("noticeId"),
                    "title": opp.get("title"),
                    "solicitationNumber": opp.get("solicitationNumber"),
                    "department": opp.get("department"),
                    "subTier": opp.get("subTier"),
                    "office": opp.get("office"),
                    "postedDate": opp.get("postedDate"),
                    "responseDeadLine": opp.get("responseDeadLine"),
                    "naicsCode": opp.get("naicsCode"),
                    "classificationCode": opp.get("classificationCode"),
                    "active": opp.get("active"),
                    "description": opp.get("description", "")[:500],  # Truncate long descriptions
                    "organizationId": opp.get("organizationId"),
                    "resourceLinks": opp.get("resourceLinks", []),
                    "pointOfContact": opp.get("pointOfContact", []),
                })
            
            return {
                "success": True,
                "total": total_records,
                "count": len(results),
                "opportunities": results,
                "query": request.keywords,
            }
            
    except httpx.TimeoutException:
        raise HTTPException(
            status_code=504,
            detail="SAM.gov API request timed out. Please try again."
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error searching SAM.gov: {str(e)}"
        )
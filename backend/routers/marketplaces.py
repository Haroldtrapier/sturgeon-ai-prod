"""
Marketplaces Router - Handles marketplace-related endpoints
"""
from fastapi import APIRouter, HTTPException
from typing import Optional, Dict, Any
from datetime import datetime

router = APIRouter(
    prefix="/api/marketplaces",
    tags=["marketplaces"]
)

# Marketplace data configuration
MARKETPLACES = {
    "sam_gov": {
        "id": "sam_gov",
        "name": "SAM.gov",
        "type": "contracts",
        "description": "Federal government contracts and opportunities",
        "api_status": "active",
        "endpoints": [
            "/api/opportunities/search",
            "/api/contracts/search"
        ]
    },
    "grants_gov": {
        "id": "grants_gov",
        "name": "Grants.gov",
        "type": "grants",
        "description": "Federal grant opportunities",
        "api_status": "active",
        "endpoints": [
            "/api/grants/search"
        ]
    }
}


@router.get("/")
async def list_marketplaces():
    """List available marketplaces"""
    marketplace_list = [
        {
            "id": m["id"],
            "name": m["name"],
            "type": m["type"],
            "description": m["description"]
        }
        for m in MARKETPLACES.values()
    ]
    return {
        "success": True,
        "marketplaces": marketplace_list,
        "timestamp": datetime.utcnow().isoformat()
    }


@router.get("/{marketplace_id}")
async def get_marketplace_details(marketplace_id: str):
    """Get details about a specific marketplace"""
    marketplace = MARKETPLACES.get(marketplace_id)
    if not marketplace:
        raise HTTPException(
            status_code=404,
            detail=f"Marketplace '{marketplace_id}' not found"
        )
    
    return {
        "success": True,
        "marketplace": marketplace,
        "timestamp": datetime.utcnow().isoformat()
    }


@router.get("/{marketplace_id}/stats")
async def get_marketplace_stats(marketplace_id: str):
    """Get statistics for a specific marketplace"""
    if marketplace_id not in MARKETPLACES:
        raise HTTPException(
            status_code=404,
            detail=f"Marketplace '{marketplace_id}' not found"
        )
    
    return {
        "success": True,
        "marketplace_id": marketplace_id,
        "stats": {
            "total_opportunities": 0,
            "active_opportunities": 0,
            "recent_updates": 0,
            "last_sync": datetime.utcnow().isoformat()
        },
        "timestamp": datetime.utcnow().isoformat()
    }

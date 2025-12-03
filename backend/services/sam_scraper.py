"""
SAM.gov scraper service for finding government contracting opportunities.
"""
import os
from typing import Dict, Any
import httpx


async def search_sam(query: str) -> Dict[str, Any]:
    """
    Search SAM.gov for opportunities matching the given query.
    
    Args:
        query: Search query string (e.g., "janitorial", "hvac", "logistics")
    
    Returns:
        Dictionary containing search results with "opportunities" key
    """
    sam_api_key = os.getenv("SAM_GOV_API_KEY", "")
    
    try:
        async with httpx.AsyncClient() as client:
            url = "https://api.sam.gov/opportunities/v2/search"
            params = {
                "api_key": sam_api_key,
                "keywords": query,
                "limit": 50,
            }
            
            response = await client.get(url, params=params, timeout=30.0)
            
            if response.status_code == 200:
                data = response.json()
                return {
                    "opportunities": data.get("opportunitiesData", []),
                    "total": len(data.get("opportunitiesData", [])),
                    "query": query
                }
            else:
                return {
                    "opportunities": [],
                    "total": 0,
                    "query": query,
                    "error": f"API returned status {response.status_code}"
                }
    except Exception as e:
        return {
            "opportunities": [],
            "total": 0,
            "query": query,
            "error": str(e)
        }

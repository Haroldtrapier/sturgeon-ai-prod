"""SAM.gov search service."""
import httpx
from typing import List, Dict, Any
import os
import logging

logger = logging.getLogger(__name__)


async def search_sam(query: str) -> List[Dict[str, Any]]:
    """
    Search SAM.gov for contract opportunities.
    
    Args:
        query: Search query string
        
    Returns:
        List of contract opportunities from SAM.gov
    """
    try:
        api_key = os.getenv("SAM_GOV_API_KEY", "")
        if not api_key:
            logger.warning("SAM_GOV_API_KEY not configured")
            return []
        
        async with httpx.AsyncClient() as client:
            url = "https://api.sam.gov/opportunities/v2/search"
            params = {
                "api_key": api_key,
                "keyword": query,
                "limit": 50
            }
            
            response = await client.get(url, params=params, timeout=30.0)
            if response.status_code == 200:
                data = response.json()
                return data.get("opportunitiesData", [])
            logger.warning(f"SAM.gov API returned status code {response.status_code}")
            return []
    except Exception as e:
        logger.error(f"Error searching SAM.gov: {e}", exc_info=True)
        return []

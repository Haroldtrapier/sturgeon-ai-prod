"""SAM.gov search service."""
import httpx
import os
import logging
from typing import List, Dict, Any

logger = logging.getLogger(__name__)


async def search_sam(query: str) -> List[Dict[str, Any]]:
    """
    Search SAM.gov for contract opportunities.
    
    Args:
        query: Search query string
        
    Returns:
        List of search results
    """
    try:
        async with httpx.AsyncClient() as client:
            # Using SAM.gov opportunities API
            url = "https://api.sam.gov/opportunities/v2/search"
            params = {
                "keywords": query,
                "limit": 10
            }
            
            # Add API key if available
            api_key = os.getenv("SAM_GOV_API_KEY")
            if api_key:
                params["api_key"] = api_key
            
            response = await client.get(url, params=params, timeout=30.0)
            
            if response.status_code == 200:
                data = response.json()
                return data.get("opportunitiesData", [])
            else:
                logger.warning(f"SAM.gov API returned status {response.status_code}")
                return []
    except Exception as e:
        logger.error(f"Error searching SAM: {e}")
        return []

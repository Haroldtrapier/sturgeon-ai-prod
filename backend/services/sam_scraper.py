"""SAM.gov search service."""
import httpx
from typing import List, Dict, Any


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
            response = await client.get(url, params=params, timeout=30.0)
            
            if response.status_code == 200:
                data = response.json()
                return data.get("opportunitiesData", [])
            else:
                return []
    except Exception as e:
        print(f"Error searching SAM: {e}")
        return []

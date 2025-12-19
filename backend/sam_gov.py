"""
SAM.gov API discovery module.
"""
import httpx
import os


async def search_sam(query: str):
    """
    Search for federal contract opportunities on SAM.gov using the provided query.
    
    Args:
        query: Search query string for SAM.gov opportunities
        
    Returns:
        JSON response from SAM.gov API
        
    Raises:
        httpx.RequestError: If the request fails
        httpx.HTTPStatusError: If the response status indicates an error
    """
    url = "https://api.sam.gov/prod/opportunities/v1/search"
    API_KEY = os.getenv("SAM_GOV_API_KEY", "YOUR_SAM_API_KEY")

    params = {
        "api_key": API_KEY,
        "q": query,
        "limit": 10
    }

    async with httpx.AsyncClient() as client:
        res = await client.get(url, params=params)
        res.raise_for_status()
        return res.json()

"""
SAM.gov API discovery module.
"""
import httpx
import os


async def search_sam(query: str):
    """
    SAM.gov API discovery module.
    
    Args:
        query: Search query string for SAM.gov opportunities
        
    Returns:
        JSON response from SAM.gov API
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
        return res.json()

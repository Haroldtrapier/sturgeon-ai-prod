import httpx
import os

async def search_sam(query: str):
    """
    SAM.gov API discovery module.
    Searches for government contract opportunities.
    """
    url = "https://api.sam.gov/prod/opportunities/v1/search"
    API_KEY = os.getenv("SAM_API_KEY", "YOUR_SAM_API_KEY")

    params = {
        "api_key": API_KEY,
        "q": query,
        "limit": 10
    }

    async with httpx.AsyncClient() as client:
        res = await client.get(url, params=params)
        return res.json()


async def get_opportunity_details(opportunity_id: str):
    """
    Fetch detailed information for a specific SAM opportunity.
    """
    url = f"https://api.sam.gov/prod/opportunities/v1/details/{opportunity_id}"
    API_KEY = os.getenv("SAM_API_KEY", "YOUR_SAM_API_KEY")

    params = {"api_key": API_KEY}

    async with httpx.AsyncClient() as client:
        res = await client.get(url, params=params)
        return res.json()


async def search_by_naics(naics_code: str):
    """
    Search SAM opportunities by NAICS code.
    """
    url = "https://api.sam.gov/prod/opportunities/v1/search"
    API_KEY = os.getenv("SAM_API_KEY", "YOUR_SAM_API_KEY")

    params = {
        "api_key": API_KEY,
        "naicsCode": naics_code,
        "limit": 20
    }

    async with httpx.AsyncClient() as client:
        res = await client.get(url, params=params)
        return res.json()

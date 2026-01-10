"""
Enhanced SAM.gov integration service
Real API integration with caching and error handling
"""
import httpx
import os
from typing import Dict, List, Any, Optional
from datetime import datetime, timedelta
import json
import hashlib


SAM_API_KEY = os.getenv("SAM_GOV_API_KEY", "")
SAM_BASE_URL = "https://api.sam.gov/opportunities/v2/search"


class SAMGovClient:
    """Client for SAM.gov Opportunities API"""
    
    def __init__(self, api_key: str = None):
        self.api_key = api_key or SAM_API_KEY
        self.base_url = SAM_BASE_URL
        self.cache = {}
        self.cache_ttl = timedelta(hours=1)
    
    def _get_cache_key(self, params: Dict) -> str:
        """Generate cache key from params"""
        param_str = json.dumps(params, sort_keys=True)
        return hashlib.md5(param_str.encode()).hexdigest()
    
    async def search_opportunities(
        self,
        query: Optional[str] = None,
        naics: Optional[str] = None,
        notice_type: Optional[str] = None,
        posted_from: Optional[str] = None,
        posted_to: Optional[str] = None,
        limit: int = 10,
        offset: int = 0,
        use_cache: bool = True
    ) -> Dict[str, Any]:
        """
        Search SAM.gov opportunities with advanced filters
        
        Args:
            query: Keyword search
            naics: NAICS code (e.g., "541330")
            notice_type: Type of notice (presol, solicitation, award, etc.)
            posted_from: Start date (YYYY-MM-DD)
            posted_to: End date (YYYY-MM-DD)
            limit: Results per page
            offset: Pagination offset
        """
        
        params = {
            "api_key": self.api_key,
            "limit": limit,
            "offset": offset,
        }
        
        if query:
            params["q"] = query
        if naics:
            params["naics"] = naics
        if notice_type:
            params["noticeType"] = notice_type
        if posted_from:
            params["postedFrom"] = posted_from
        if posted_to:
            params["postedTo"] = posted_to
        
        # Check cache
        cache_key = self._get_cache_key(params)
        if use_cache and cache_key in self.cache:
            cached_data, cached_time = self.cache[cache_key]
            if datetime.now() - cached_time < self.cache_ttl:
                print(f"[SAM.gov] Cache hit for query: {query}")
                return cached_data
        
        # Make API request
        async with httpx.AsyncClient() as client:
            try:
                response = await client.get(
                    self.base_url,
                    params=params,
                    timeout=30.0
                )
                response.raise_for_status()
                
                data = response.json()
                
                # Parse and structure response
                result = {
                    "total_count": data.get("totalRecords", 0),
                    "opportunities": [],
                    "offset": offset,
                    "limit": limit
                }
                
                for opp in data.get("opportunitiesData", []):
                    result["opportunities"].append({
                        "id": opp.get("noticeId"),
                        "title": opp.get("title"),
                        "type": opp.get("type"),
                        "base_type": opp.get("baseType"),
                        "department": opp.get("departmentName"),
                        "sub_agency": opp.get("subAgency"),
                        "office": opp.get("office"),
                        "posted_date": opp.get("postedDate"),
                        "response_deadline": opp.get("responseDeadLine"),
                        "naics_code": opp.get("naicsCode"),
                        "classification_code": opp.get("classificationCode"),
                        "active": opp.get("active"),
                        "archive": opp.get("archive"),
                        "description": opp.get("description", "")[:500],  # First 500 chars
                        "set_aside": opp.get("typeOfSetAside"),
                        "place_of_performance": opp.get("placeOfPerformance", {}),
                    })
                
                # Cache result
                self.cache[cache_key] = (result, datetime.now())
                
                print(f"[SAM.gov] Found {result['total_count']} opportunities")
                return result
                
            except httpx.HTTPError as e:
                print(f"[SAM.gov] HTTP error: {e}")
                return {
                    "error": str(e),
                    "total_count": 0,
                    "opportunities": []
                }
            except Exception as e:
                print(f"[SAM.gov] Error: {e}")
                return {
                    "error": str(e),
                    "total_count": 0,
                    "opportunities": []
                }
    
    async def get_opportunity_details(self, notice_id: str) -> Dict[str, Any]:
        """Get full details for a specific opportunity"""
        url = f"https://api.sam.gov/opportunities/v2/opportunities/{notice_id}"
        
        async with httpx.AsyncClient() as client:
            try:
                response = await client.get(
                    url,
                    params={"api_key": self.api_key},
                    timeout=30.0
                )
                response.raise_for_status()
                return response.json()
            except Exception as e:
                print(f"[SAM.gov] Error getting details: {e}")
                return {"error": str(e)}
    
    async def search_by_setaside(
        self,
        setaside_type: str,
        query: Optional[str] = None,
        limit: int = 20
    ) -> Dict[str, Any]:
        """
        Search for opportunities by set-aside type
        
        Set-aside types:
        - SBA - Small Business Set-Aside
        - SBP - Small Business Set-Aside (Total)
        - 8A - 8(a) Set-Aside
        - HZC - HUBZone Set-Aside
        - SDVOSBC - Service-Disabled Veteran-Owned Small Business Set-Aside
        - WOSB - Women-Owned Small Business
        - VSA - Veteran-Owned Small Business Set-Aside
        """
        params = {
            "typeOfSetAside": setaside_type,
            "limit": limit
        }
        
        if query:
            params["q"] = query
        
        return await self.search_opportunities(**params)


# Global client instance
sam_client = SAMGovClient()


# Convenience functions
async def search_sam(
    query: str,
    naics: Optional[str] = None,
    limit: int = 10
) -> Dict[str, Any]:
    """Quick search function"""
    return await sam_client.search_opportunities(query=query, naics=naics, limit=limit)


async def search_sdvosb_opportunities(
    query: Optional[str] = None,
    limit: int = 20
) -> Dict[str, Any]:
    """Search for SDVOSB set-aside opportunities"""
    return await sam_client.search_by_setaside("SDVOSBC", query=query, limit=limit)


async def get_recent_opportunities(days: int = 7, limit: int = 50) -> Dict[str, Any]:
    """Get opportunities posted in the last N days"""
    from_date = (datetime.now() - timedelta(days=days)).strftime("%Y-%m-%d")
    to_date = datetime.now().strftime("%Y-%m-%d")
    
    return await sam_client.search_opportunities(
        posted_from=from_date,
        posted_to=to_date,
        limit=limit
    )

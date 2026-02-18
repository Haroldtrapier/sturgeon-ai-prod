"""
USASpending.gov API Client for federal spending data.
Provides access to agency spending, award data, and budget information.
"""
import httpx
from typing import Optional, Dict, Any, List
from datetime import datetime


class USASpendingClient:
    """Client for USASpending.gov API v2."""

    BASE_URL = "https://api.usaspending.gov/api/v2"

    def __init__(self):
        self.timeout = 30.0

    async def get_agency_spending(
        self,
        agency_code: str,
        fiscal_year: int = None,
    ) -> Dict[str, Any]:
        """Get agency spending overview."""
        fy = fiscal_year or datetime.now().year
        async with httpx.AsyncClient(timeout=self.timeout) as client:
            try:
                response = await client.get(
                    f"{self.BASE_URL}/agency/{agency_code}/budgetary_resources/",
                    params={"fiscal_year": fy},
                )
                response.raise_for_status()
                return response.json()
            except Exception as e:
                print(f"[USASpending] Error getting agency spending: {e}")
                return {"error": str(e)}

    async def search_awards(
        self,
        keyword: Optional[str] = None,
        agency: Optional[str] = None,
        naics: Optional[str] = None,
        award_type: Optional[str] = "contracts",
        fiscal_year: Optional[int] = None,
        limit: int = 50,
        page: int = 1,
    ) -> Dict[str, Any]:
        """Search awards with filters."""
        filters = {}

        if award_type == "contracts":
            filters["award_type_codes"] = ["A", "B", "C", "D"]
        elif award_type == "grants":
            filters["award_type_codes"] = ["02", "03", "04", "05"]

        if keyword:
            filters["keywords"] = [keyword]
        if agency:
            filters["agencies"] = [
                {"type": "awarding", "tier": "toptier", "name": agency}
            ]
        if naics:
            filters["naics_codes"] = [{"naics": naics, "tier": "toptier"}]
        if fiscal_year:
            filters["time_period"] = [
                {
                    "start_date": f"{fiscal_year - 1}-10-01",
                    "end_date": f"{fiscal_year}-09-30",
                }
            ]

        payload = {
            "filters": filters,
            "fields": [
                "Award ID",
                "Recipient Name",
                "Start Date",
                "End Date",
                "Award Amount",
                "Awarding Agency",
                "Awarding Sub Agency",
                "Contract Award Type",
                "Description",
                "NAICS Code",
            ],
            "page": page,
            "limit": limit,
            "sort": "Award Amount",
            "order": "desc",
        }

        async with httpx.AsyncClient(timeout=self.timeout) as client:
            try:
                response = await client.post(
                    f"{self.BASE_URL}/search/spending_by_award/",
                    json=payload,
                )
                response.raise_for_status()
                data = response.json()
                return {
                    "total": data.get("page_metadata", {}).get("total", 0),
                    "page": page,
                    "limit": limit,
                    "results": data.get("results", []),
                }
            except Exception as e:
                print(f"[USASpending] Error searching awards: {e}")
                return {"error": str(e), "total": 0, "results": []}

    async def get_spending_by_category(
        self,
        category: str = "naics",
        agency: Optional[str] = None,
        fiscal_year: Optional[int] = None,
        limit: int = 20,
    ) -> Dict[str, Any]:
        """Get spending broken down by category (naics, psc, agency, etc.)."""
        fy = fiscal_year or datetime.now().year
        filters = {
            "time_period": [
                {
                    "start_date": f"{fy - 1}-10-01",
                    "end_date": f"{fy}-09-30",
                }
            ],
            "award_type_codes": ["A", "B", "C", "D"],
        }
        if agency:
            filters["agencies"] = [
                {"type": "awarding", "tier": "toptier", "name": agency}
            ]

        valid_categories = ["naics", "psc", "awarding_agency", "awarding_subagency", "recipient"]
        if category not in valid_categories:
            category = "naics"

        payload = {
            "filters": filters,
            "category": category,
            "limit": limit,
        }

        async with httpx.AsyncClient(timeout=self.timeout) as client:
            try:
                response = await client.post(
                    f"{self.BASE_URL}/search/spending_by_category/{category}/",
                    json=payload,
                )
                response.raise_for_status()
                return response.json()
            except Exception as e:
                print(f"[USASpending] Error getting spending by category: {e}")
                return {"error": str(e)}

    async def get_spending_over_time(
        self,
        agency: Optional[str] = None,
        naics: Optional[str] = None,
        group: str = "fiscal_year",
    ) -> Dict[str, Any]:
        """Get spending aggregated over time periods."""
        current_year = datetime.now().year
        filters = {
            "time_period": [
                {
                    "start_date": f"{current_year - 5}-10-01",
                    "end_date": f"{current_year}-09-30",
                }
            ],
            "award_type_codes": ["A", "B", "C", "D"],
        }
        if agency:
            filters["agencies"] = [
                {"type": "awarding", "tier": "toptier", "name": agency}
            ]
        if naics:
            filters["naics_codes"] = [{"naics": naics, "tier": "toptier"}]

        payload = {
            "filters": filters,
            "group": group,
        }

        async with httpx.AsyncClient(timeout=self.timeout) as client:
            try:
                response = await client.post(
                    f"{self.BASE_URL}/search/spending_over_time/",
                    json=payload,
                )
                response.raise_for_status()
                return response.json()
            except Exception as e:
                print(f"[USASpending] Error getting spending over time: {e}")
                return {"error": str(e)}

    async def get_recipient_profile(self, recipient_id: str) -> Dict[str, Any]:
        """Get recipient (vendor) profile."""
        async with httpx.AsyncClient(timeout=self.timeout) as client:
            try:
                response = await client.get(
                    f"{self.BASE_URL}/recipient/{recipient_id}/",
                )
                response.raise_for_status()
                return response.json()
            except Exception as e:
                print(f"[USASpending] Error getting recipient profile: {e}")
                return {"error": str(e)}

    async def autocomplete_agency(self, search_text: str) -> List[Dict[str, Any]]:
        """Autocomplete agency names."""
        async with httpx.AsyncClient(timeout=self.timeout) as client:
            try:
                response = await client.post(
                    f"{self.BASE_URL}/autocomplete/awarding_agency/",
                    json={"search_text": search_text, "limit": 10},
                )
                response.raise_for_status()
                return response.json().get("results", [])
            except Exception as e:
                print(f"[USASpending] Autocomplete error: {e}")
                return []

    async def autocomplete_naics(self, search_text: str) -> List[Dict[str, Any]]:
        """Autocomplete NAICS codes."""
        async with httpx.AsyncClient(timeout=self.timeout) as client:
            try:
                response = await client.post(
                    f"{self.BASE_URL}/autocomplete/naics/",
                    json={"search_text": search_text, "limit": 10},
                )
                response.raise_for_status()
                return response.json().get("results", [])
            except Exception as e:
                print(f"[USASpending] NAICS autocomplete error: {e}")
                return []


usaspending_client = USASpendingClient()

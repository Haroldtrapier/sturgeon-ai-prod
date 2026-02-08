"""
FPDS / USASpending Awards Search Client.
Uses the USASpending API v2 for historical contract award data.
"""
import httpx
from typing import Optional, Dict, Any, List
from datetime import datetime


class FPDSClient:
    """Client for searching historical contract awards via USASpending Award Search API."""

    BASE_URL = "https://api.usaspending.gov/api/v2"

    def __init__(self):
        self.timeout = 30.0

    async def search_contracts(
        self,
        naics: Optional[str] = None,
        agency: Optional[str] = None,
        keyword: Optional[str] = None,
        fiscal_year: Optional[int] = None,
        min_amount: Optional[float] = None,
        max_amount: Optional[float] = None,
        limit: int = 50,
        page: int = 1,
    ) -> Dict[str, Any]:
        """Search historical contract awards."""
        filters = {"award_type_codes": ["A", "B", "C", "D"]}  # Contract types

        if naics:
            filters["naics_codes"] = [{"naics": naics, "tier": "toptier"}]
        if agency:
            filters["agencies"] = [
                {"type": "awarding", "tier": "toptier", "name": agency}
            ]
        if keyword:
            filters["keywords"] = [keyword]
        if fiscal_year:
            filters["time_period"] = [
                {
                    "start_date": f"{fiscal_year - 1}-10-01",
                    "end_date": f"{fiscal_year}-09-30",
                }
            ]
        if min_amount is not None or max_amount is not None:
            amount_filter = {}
            if min_amount is not None:
                amount_filter["lower_bound"] = min_amount
            if max_amount is not None:
                amount_filter["upper_bound"] = max_amount
            filters["award_amounts"] = [amount_filter]

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
                "recipient_id",
                "internal_id",
                "generated_internal_id",
                "Description",
                "NAICS Code",
                "PSC Code",
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

                results = []
                for award in data.get("results", []):
                    results.append({
                        "contract_id": award.get("Award ID", ""),
                        "vendor_name": award.get("Recipient Name", ""),
                        "agency": award.get("Awarding Agency", ""),
                        "sub_agency": award.get("Awarding Sub Agency", ""),
                        "award_amount": award.get("Award Amount"),
                        "start_date": award.get("Start Date"),
                        "end_date": award.get("End Date"),
                        "award_type": award.get("Contract Award Type", ""),
                        "description": award.get("Description", ""),
                        "naics_code": award.get("NAICS Code", ""),
                        "psc_code": award.get("PSC Code", ""),
                        "internal_id": award.get("internal_id") or award.get("generated_internal_id"),
                    })

                return {
                    "total": data.get("page_metadata", {}).get("total", 0),
                    "page": page,
                    "limit": limit,
                    "results": results,
                }

            except httpx.HTTPError as e:
                print(f"[FPDS] HTTP error: {e}")
                return {"error": str(e), "total": 0, "results": []}
            except Exception as e:
                print(f"[FPDS] Error: {e}")
                return {"error": str(e), "total": 0, "results": []}

    async def get_contract_details(self, award_id: str) -> Dict[str, Any]:
        """Get detailed information about a specific contract award."""
        async with httpx.AsyncClient(timeout=self.timeout) as client:
            try:
                response = await client.get(
                    f"{self.BASE_URL}/awards/{award_id}/",
                )
                response.raise_for_status()
                return response.json()
            except Exception as e:
                print(f"[FPDS] Error getting contract details: {e}")
                return {"error": str(e)}

    async def get_agency_spending_summary(
        self,
        agency_name: str,
        fiscal_year: int = None,
    ) -> Dict[str, Any]:
        """Get spending summary for an agency."""
        fy = fiscal_year or datetime.now().year
        filters = {
            "agencies": [{"type": "awarding", "tier": "toptier", "name": agency_name}],
            "time_period": [
                {
                    "start_date": f"{fy - 1}-10-01",
                    "end_date": f"{fy}-09-30",
                }
            ],
            "award_type_codes": ["A", "B", "C", "D"],
        }

        payload = {
            "filters": filters,
            "category": "naics",
            "limit": 20,
        }

        async with httpx.AsyncClient(timeout=self.timeout) as client:
            try:
                response = await client.post(
                    f"{self.BASE_URL}/search/spending_by_category/naics/",
                    json=payload,
                )
                response.raise_for_status()
                return response.json()
            except Exception as e:
                print(f"[FPDS] Error getting agency spending: {e}")
                return {"error": str(e)}


fpds_client = FPDSClient()

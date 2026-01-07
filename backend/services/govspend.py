# backend/services/govspend.py

from typing import List, Dict

async def search_govspend(query: str) -> List[Dict]:
    """
    Stub for GovSpend integration.

    Later:
    - Use GovSpend API or browser automation
    - Pull historical spend / PO lines for agencies

    Returns a list of simple dict records for now.
    """
    return [
        {
            "id": "GSP-001",
            "description": f"GovSpend placeholder spend record for '{query}'",
            "agency": "City of Charlotte",
            "amount": 125000.00,
            "source": "GovSpend",
        }
    ]


async def get_agency_spend(agency_name: str, naics: str = None) -> Dict:
    """
    Get historical spending data for a specific agency.

    Optionally filter by NAICS code.
    Returns spend trends, top vendors, and category breakdown.
    """
    return {
        "agency": agency_name,
        "naics": naics,
        "total_spend": "$2.5M",
        "time_period": "FY 2024",
        "top_vendors": [
            {"vendor": "Acme Corp", "amount": "$850K"},
            {"vendor": "Beta LLC", "amount": "$650K"},
            {"vendor": "Gamma Inc", "amount": "$400K"}
        ],
        "categories": [
            {"category": "IT Services", "percent": 45},
            {"category": "Consulting", "percent": 35},
            {"category": "Supplies", "percent": 20}
        ],
        "source": "GovSpend"
    }


async def get_vendor_spend(vendor_name: str) -> Dict:
    """
    Get spending data for a specific vendor.

    Returns total contract values, agencies they work with, and growth trends.
    """
    return {
        "vendor": vendor_name,
        "total_contracts": 25,
        "total_value": "$3.2M",
        "year_over_year_growth": "+15%",
        "top_agencies": [
            {"agency": "DOD", "amount": "$1.5M"},
            {"agency": "VHA", "amount": "$900K"},
            {"agency": "DHS", "amount": "$800K"}
        ],
        "primary_categories": ["IT Services", "Cybersecurity"],
        "source": "GovSpend"
    }


async def get_spending_trends(naics: str, time_period: str = "FY24") -> Dict:
    """
    Analyze spending trends for a specific NAICS code.

    Returns trend data, top agencies, and average contract sizes.
    """
    return {
        "naics": naics,
        "time_period": time_period,
        "total_spend": "$15.5M",
        "transaction_count": 342,
        "average_contract_size": "$45K",
        "trend": "+12% from prior year",
        "top_spending_agencies": [
            {"agency": "DOD", "amount": "$6.2M"},
            {"agency": "DVA", "amount": "$3.9M"},
            {"agency": "GSA", "amount": "$2.4M"}
        ],
        "source": "GovSpend"
    }


async def get_small_business_spend(region: str = None) -> Dict:
    """
    Get spending data specific to small business set-asides.

    Optionally filter by region.
    Returns 8(a), WOSB, HUbZone, and VET spending.
    """
    return {
        "region": region or "National",
        "total_small_business_spend": "$32B",
        "percent_of_total": "23%",
        "breakdown": [
            {"category": "8(a)", "amount": "$12B"},
            {"category": "WOSB", "amount": "$8B"},
            {"category": "HubZone", "amount": "$7B"},
            {"category": "VET", "amount": "$5B"}
        ],
        "source": "GovSpend"
    }

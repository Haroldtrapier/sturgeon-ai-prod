from typing import List, Dict, Any

async def search_govspend(query: str) -> List[Dict[str, Any]]:
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

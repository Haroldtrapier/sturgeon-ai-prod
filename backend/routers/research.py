from fastapi import APIRouter, Depends
from typing import Optional

router = APIRouter(prefix="/api/research", tags=["research"])

try:
    from services.auth import get_user
    from services.llm import allm_chat
    from integrations.usaspending_client import usaspending_client
    from integrations.fpds_client import fpds_client
except ImportError:
    try:
        from backend.services.auth import get_user
        from backend.services.llm import allm_chat
        from backend.integrations.usaspending_client import usaspending_client
        from backend.integrations.fpds_client import fpds_client
    except ImportError:
        usaspending_client = None
        fpds_client = None

        async def allm_chat(*a, **kw):
            return "LLM not configured."

        def get_user():
            return None


@router.get("/market")
async def market_intelligence(
    agency: Optional[str] = None,
    naics: Optional[str] = None,
    timeframe: str = "last_year",
    user=Depends(get_user),
):
    """Get market intelligence and spending trends."""
    data = {}
    if usaspending_client:
        try:
            spending = await usaspending_client.search_awards(
                keyword=None, agency=agency, naics=naics, limit=10
            )
            data["awards"] = spending.get("results", [])
            data["total"] = spending.get("total", 0)
        except Exception:
            data["awards"] = []

    prompt = f"Provide market intelligence for agency={agency}, NAICS={naics}, timeframe={timeframe}. Summarize spending trends, competition level, and recommendations."
    try:
        analysis = await allm_chat(
            "You are a government contracting market analyst. Provide actionable intelligence.",
            prompt,
        )
        data["ai_analysis"] = analysis
    except Exception:
        data["ai_analysis"] = None

    return data


@router.get("/contracts")
async def search_contracts(
    agency: Optional[str] = None,
    naics: Optional[str] = None,
    vendor: Optional[str] = None,
    min_amount: Optional[float] = None,
    limit: int = 20,
    user=Depends(get_user),
):
    """Search historical contracts via FPDS/USASpending."""
    if fpds_client:
        try:
            results = await fpds_client.search_contracts(
                naics=naics, agency=agency, keyword=vendor, limit=limit
            )
            return results
        except Exception as e:
            return {"contracts": [], "error": str(e)}
    return {"contracts": [], "message": "FPDS integration not available."}


@router.get("/competitors")
async def analyze_competitors(
    naics: str,
    region: Optional[str] = None,
    user=Depends(get_user),
):
    """Analyze competitors in your market using USASpending data."""
    competitors = []
    if usaspending_client:
        try:
            results = await usaspending_client.get_spending_by_category(
                category="recipient", naics=naics, limit=20
            )
            competitors = results.get("results", [])
        except Exception:
            pass

    prompt = f"Analyze the competitive landscape for NAICS {naics}{f' in {region}' if region else ''}."
    try:
        analysis = await allm_chat(
            "You are a government contracting competitive intelligence analyst.",
            prompt,
        )
    except Exception:
        analysis = None

    return {"naics": naics, "region": region, "competitors": competitors, "ai_analysis": analysis}


@router.get("/agencies")
async def get_agency_data(
    agency_name: Optional[str] = None,
    user=Depends(get_user),
):
    """Get detailed agency contracting data."""
    data = {"agency": agency_name or "All Agencies"}
    if usaspending_client:
        try:
            if agency_name:
                spending = await usaspending_client.search_awards(agency=agency_name, limit=5)
                data["recent_awards"] = spending.get("results", [])
            autocomplete = await usaspending_client.autocomplete_agency(agency_name or "Department")
            data["agencies"] = autocomplete.get("results", [])
        except Exception:
            pass
    return data


@router.get("/forecast")
async def get_forecast(
    agency: Optional[str] = None,
    naics: Optional[str] = None,
    user=Depends(get_user),
):
    """Get AI-powered contract forecasting."""
    prompt = f"Forecast upcoming government contracting opportunities for agency={agency}, NAICS={naics}. Consider current spending trends and provide actionable recommendations."
    try:
        forecast = await allm_chat(
            "You are a government contracting forecasting specialist.",
            prompt,
        )
    except Exception:
        forecast = "Forecast not available."

    return {"agency": agency, "naics": naics, "forecast": forecast}

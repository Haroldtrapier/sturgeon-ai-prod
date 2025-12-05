from fastapi import APIRouter, HTTPException, Query
from ..services.govwin import search_govwin
from ..services.govspend import search_govspend
from ..services.sam_scraper import search_sam

router = APIRouter(prefix="/marketplaces", tags=["Marketplaces"])

@router.get("/sam")
async def sam_search(q: str = Query(..., min_length=1, max_length=200, description="Search query")):
    """Search SAM.gov for contract opportunities."""
    try:
        data = await search_sam(q)
        return {"results": data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error searching SAM.gov: {str(e)}")

@router.get("/govwin")
async def govwin_search(q: str = Query(..., min_length=1, max_length=200, description="Search query")):
    """Search GovWin for government contracting opportunities."""
    try:
        data = await search_govwin(q)
        return {"results": data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error searching GovWin: {str(e)}")

@router.get("/govspend")
async def govspend_search(q: str = Query(..., min_length=1, max_length=200, description="Search query")):
    """Search GovSpend for government spending data."""
    try:
        data = await search_govspend(q)
        return {"results": data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error searching GovSpend: {str(e)}")

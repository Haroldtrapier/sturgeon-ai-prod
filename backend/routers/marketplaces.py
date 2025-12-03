from fastapi import APIRouter
from services.govwin import search_govwin
from services.govspend import search_govspend
from services.sam_scraper import search_sam

router = APIRouter(prefix="/marketplaces", tags=["Marketplaces"])

@router.get("/sam")
async def sam_search(q: str):
    data = await search_sam(q)
    return {"results": data}

@router.get("/govwin")
async def govwin_search(q: str):
    data = await search_govwin(q)
    return {"results": data}

@router.get("/govspend")
async def govspend_search(q: str):
    data = await search_govspend(q)
    return {"results": data}

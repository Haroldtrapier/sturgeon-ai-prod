"""
Service layer tests
"""
import pytest
from services.sam_scraper import search_sam


@pytest.mark.asyncio
async def test_sam_search():
    """Test SAM.gov search service"""
    result = await search_sam("software development")
    assert result is not None
    assert isinstance(result, dict)


@pytest.mark.asyncio
async def test_sam_search_empty_query():
    """Test SAM search with empty query"""
    result = await search_sam("")
    assert result is not None

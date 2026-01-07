import os
import asyncio
import logging
from typing import Any, AsyncGenerator, Dict, List, Optional

import aiohttp
from aiohttp import ClientResponseError

# Async DB support – using asyncpg for PostgreSQL.
# If you prefer another DB/ORM, replace the relevant parts.
import asyncpg

# ----------------------------------------------------------------------
# Configuration
# ----------------------------------------------------------------------
SAM_API_BASE_URL = os.getenv("SAM_API_BASE_URL", "https://api.sam.gov/prod/opportunities/v1")
SAM_API_KEY = os.getenv("SAM_API_KEY")  # Required – raise if missing later
PAGE_SIZE = int(os.getenv("SAM_PAGE_SIZE", "100"))  # Max allowed by SAM is 100

# Database connection settings
DB_DSN = os.getenv(
    "DATABASE_DSN",
    "postgresql://user:password@localhost:5432/govcon",
)

# Logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s %(name)s %(message)s",
)
logger = logging.getLogger("govcon_client")

# ----------------------------------------------------------------------
# Helper Types
# ----------------------------------------------------------------------
Opportunity = Dict[str, Any]  # Adjust to a TypedDict if you want stricter typing


# ----------------------------------------------------------------------
# HTTP Client
# ----------------------------------------------------------------------
class SamGovClient:
    """
    Async client for the SAM.gov Opportunities API.
    Handles authentication, pagination and basic error handling.
    """

    def __init__(self, api_key: str, base_url: str = SAM_API_BASE_URL, page_size: int = PAGE_SIZE):
        if not api_key:
            raise ValueError("SAM_API_KEY must be provided via environment variable.")
        self.api_key = api_key
        self.base_url = base_url.rstrip("/")
        self.page_size = page_size
        self.session: Optional[aiohttp.ClientSession] = None

    async def __aenter__(self):
        headers = {"Authorization": f"Bearer {self.api_key}"}
        timeout = aiohttp.ClientTimeout(total=60)  # 60 seconds total timeout per request
        self.session = aiohttp.ClientSession(headers=headers, timeout=timeout)
        return self

    async def __aexit__(self, exc_type, exc, tb):
        if self.session:
            await self.session.close()

    async def fetch_page(
        self,
        endpoint: str,
        params: Optional[Dict[str, Any]] = None,
    ) -> Dict[str, Any]:
        """
        Fetch a single page from the SAM.gov API.
        Raises ClientResponseError on non‑2xx responses.
        """
        if self.session is None:
            raise RuntimeError("Client session not initialized. Use async context manager.")

        url = f"{self.base_url}{endpoint}"
        logger.debug("Fetching URL %s with params %s", url, params)

        async with self.session.get(url, params=params) as resp:
            if resp.status != 200:
                text = await resp.text()
                raise ClientResponseError(
                    request_info=resp.request_info,
                    history=resp.history,
                    status=resp.status,
                    message=f"Unexpected status {resp.status}: {text}",
                )
            data = await resp.json()
            logger.debug("Received %d items", len(data.get("opportunities", [])))
            return data

    async def iter_opportunities(
        self,
        filters: Optional[Dict[str, Any]] = None,
        max_pages: Optional[int] = None,
    ) -> AsyncGenerator[Opportunity, None]:
        """
        Async generator that yields opportunities across all pages.

        :param filters: Mapping of SAM.gov filter parameters (e.g. {"setAside": "SBA"}).
        :param max_pages: Optional cap on number of pages to fetch (useful for testing).
        """
        endpoint = "/opportunities"
        page = 1
        fetched = 0

        while True:
            params = {
                "page": page,
                "pageSize": self.page_size,
                **(filters or {}),
            }
            logger.info("Requesting page %d", page)
            page_data = await self.fetch_page(endpoint, params=params)

            opportunities: List[Opportunity] = page_data.get("opportunities", [])
            if not opportunities:
                logger.info("No more opportunities returned; terminating pagination.")
                break

            for opp in opportunities:
                yield opp
                fetched += 1

            # Pagination handling – SAM returns a `nextPage` token or we can rely on page count.
            # The API includes a `totalPages` field; we stop when we hit it.
            total_pages = page_data.get("totalPages")
            if total_pages is not None and page >= total_pages:
                logger.info("Reached last page (%d of %d).", page, total_pages)
                break

            page += 1
            if max_pages is not None and page > max_pages:
                logger.info("Reached max_pages limit (%d).", max_pages)
                break


# ----------------------------------------------------------------------
# Database Layer
# ----------------------------------------------------------------------
class OpportunityRepository:
    """
    Simple repository that upserts opportunities into a PostgreSQL table.
    The table schema is expected to be:

    CREATE TABLE IF NOT EXISTS opportunities (
        id TEXT PRIMARY KEY,
        data JSONB NOT NULL,
        fetched_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
    """

    def __init__(self, dsn: str = DB_DSN):
        self.dsn = dsn
        self.pool: Optional[asyncpg.Pool] = None

    async def __aenter__(self):
        self.pool = await asyncpg.create_pool(dsn=self.dsn, min_size=1, max_size=5)
        async with self.pool.acquire() as conn:
            await conn.execute(
                """
                CREATE TABLE IF NOT EXISTS opportunities (
                    id TEXT PRIMARY KEY,
                    data JSONB NOT NULL,
                    fetched_at TIMESTAMPTZ NOT NULL DEFAULT now()
                );
                """
            )
        return self

    async def __aexit__(self, exc_type, exc, tb):
        if self.pool:
            await self.pool.close()

    async def upsert(self, opportunity: Opportunity):
        """
        Insert a new opportunity or update the existing row.
        The SAM opportunity payload contains a unique `id` field.
        """
        if self.pool is None:
            raise RuntimeError("Database pool not initialized. Use async context manager.")

        opp_id = opportunity.get("id")
        if not opp_id:
            logger.warning("Skipping opportunity without 'id': %s", opportunity)
            return

        async with self.pool.acquire() as conn:
            await conn.execute(
                """
                INSERT INTO opportunities (id, data)
                VALUES ($1, $2)
                ON CONFLICT (id) DO UPDATE
                SET data = EXCLUDED.data,
                    fetched_at = now();
                """,
                opp_id,
                opportunity,
            )
            logger.debug("Upserted opportunity %s", opp_id)


# ----------------------------------------------------------------------
# Orchestration
# ----------------------------------------------------------------------
async def sync_opportunities(
    filters: Optional[Dict[str, Any]] = None,
    max_pages: Optional[int] = None,
) -> int:
    """
    Pull opportunities from SAM.gov and sync them to the database.

    :return: Number of records processed.
    """
    processed = 0
    async with SamGovClient(api_key=SAM_API_KEY) as client, OpportunityRepository() as repo:
        async for opp in client.iter_opportunities(filters=filters, max_pages=max_pages):
            await repo.upsert(opp)
            processed += 1
            if processed % 100 == 0:
                logger.info("Processed %d opportunities so far...", processed)

    logger.info("Sync completed. Total opportunities processed: %d", processed)
    return processed


# ----------------------------------------------------------------------
# CLI entry point (optional)
# ----------------------------------------------------------------------
if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(description="Sync SAM.gov opportunities to a local DB.")
    parser.add_argument(
        "--filter",
        action="append",
        help="Filter in key=value form (e.g. setAside=SBA). Can be used multiple times.",
    )
    parser.add_argument(
        "--max-pages",
        type=int,
        default=None,
        help="Maximum number of pages to fetch (for testing).",
    )
    args = parser.parse_args()

    # Convert filter args into a dict
    filter_dict: Dict[str, str] = {}
    if args.filter:
        for f in args.filter:
            if "=" not in f:
                raise ValueError(f"Invalid filter format: {f}. Expected key=value.")
            k, v = f.split("=", 1)
            filter_dict[k] = v

    try:
        asyncio.run(sync_opportunities(filters=filter_dict or None, max_pages=args.max_pages))
    except Exception as exc:
        logger.exception("Sync failed: %s", exc)
        raise SystemExit(1)

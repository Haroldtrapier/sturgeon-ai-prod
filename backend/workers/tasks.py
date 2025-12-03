import asyncio
from datetime import datetime

from services.sam_scraper import search_sam
from services.embeddings_ai import rebuild_all_embeddings
from database import SessionLocal
from models.proposal import Proposal


async def nightly_sam_scan():
    """
    Example nightly task:
    - Pulls a simple SAM.gov search for your core NAICS
    - Later: store in DB and surface in UI
    """
    print("[workers] Running nightly SAM scan...")
    queries = ["janitorial", "hvac", "logistics"]

    for q in queries:
        try:
            data = await search_sam(q)
            print(f"[workers] SAM results for '{q}':", len(data.get("opportunities", [])))
        except Exception as e:
            print(f"[workers] SAM scan error for '{q}': {e}")


async def nightly_embeddings_rebuild():
    """
    Rebuilds embeddings for all proposals as a maintenance job.
    """
    print("[workers] Rebuilding proposal embeddings...")
    await rebuild_all_embeddings()
    print("[workers] Embedding rebuild completed.")


async def daily_worker_cycle():
    """
    Run once per day (e.g., via cron or external scheduler).
    This just orchestrates other tasks.
    """
    print(f"[workers] Daily worker cycle started at {datetime.utcnow().isoformat()}")

    await nightly_sam_scan()
    await nightly_embeddings_rebuild()

    print(f"[workers] Daily worker cycle finished at {datetime.utcnow().isoformat()}")

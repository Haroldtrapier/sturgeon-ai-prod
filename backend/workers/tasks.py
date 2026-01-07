# backend/workers/tasks.py

import asyncio
from datetime import datetime, timedelta

from services.sam_scraper import search_sam
# from services.embeddings_ai import rebuild_all_embeddings  # TODO: create function
from database import SessionLocal
# from models.proposal import Proposal  # TODO: create model


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
            # TODO: Store opportunities in database
        except Exception as e:
            print(f"[workers] SAM scan error for '{q}': {e}")


async def nightly_embeddings_rebuild():
    """
    Rebuilds embeddings for all proposals as a maintenance job.
    """
    print("[workers] Rebuilding proposal embeddings...")
    # TODO: Implement rebuild_all_embeddings() function
    # await rebuild_all_embeddings()
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


# Celery task wrapper (optional)
# Uncomment when ready to use Celery:
# from workers.worker import celery_app
#
# @celery_app.task
# def run_daily_worker():
#     asyncio.run(daily_worker_cycle())

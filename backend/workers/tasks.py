# backend/workers/tasks.py
"""
Background worker tasks for scheduled jobs
"""
import asyncio
from datetime import datetime, timedelta
from typing import List, Dict, Any
import uuid

from services.sam_scraper import search_sam
from services.embeddings_ai import rebuild_all_embeddings
from database import SessionLocal
from models.proposal import Proposal


async def store_opportunities_in_db(opportunities: List[Dict[str, Any]], source: str = "sam.gov"):
    """
    Store discovered opportunities in database for later matching
    """
    db = SessionLocal()
    try:
        stored_count = 0
        for opp in opportunities:
            # Here we'd create an Opportunity record
            # For now, just log it
            print(f"[workers] Would store opportunity: {opp.get('title', 'Untitled')}")
            stored_count += 1
        
        db.commit()
        print(f"[workers] Stored {stored_count} opportunities from {source}")
        return stored_count
    except Exception as e:
        db.rollback()
        print(f"[workers] Error storing opportunities: {e}")
        return 0
    finally:
        db.close()


async def nightly_sam_scan():
    """
    Example nightly task:
    - Pulls a simple SAM.gov search for your core NAICS
    - Stores opportunities in database
    """
    print("[workers] Running nightly SAM scan...")
    queries = ["janitorial", "hvac", "logistics", "IT services", "cybersecurity"]

    total_stored = 0
    for q in queries:
        try:
            data = await search_sam(q)
            opportunities = data.get("opportunities", [])
            print(f"[workers] SAM results for '{q}': {len(opportunities)}")
            
            # Store opportunities in database
            stored = await store_opportunities_in_db(opportunities, source=f"sam.gov:{q}")
            total_stored += stored
            
        except Exception as e:
            print(f"[workers] SAM scan error for '{q}': {e}")
    
    print(f"[workers] Total opportunities stored: {total_stored}")
    return total_stored


async def nightly_embeddings_rebuild(user_id: str = None):
    """
    Rebuilds embeddings for all proposals as a maintenance job.
    """
    print("[workers] Rebuilding proposal embeddings...")
    
    try:
        db = SessionLocal()
        count = rebuild_all_embeddings(user_id=user_id, db=db)
        print(f"[workers] Embedding rebuild completed. Rebuilt {count} embeddings.")
        return count
    except Exception as e:
        print(f"[workers] Embedding rebuild error: {e}")
        return 0


async def cleanup_old_search_cache():
    """
    Clean up old semantic search cache entries
    """
    print("[workers] Cleaning up old search cache...")
    db = SessionLocal()
    
    try:
        from models.embeddings import SemanticSearchCache
        from sqlalchemy import func
        
        # Delete cache entries older than 7 days
        cutoff_date = datetime.utcnow() - timedelta(days=7)
        deleted = db.query(SemanticSearchCache).filter(
            SemanticSearchCache.created_at < cutoff_date
        ).delete()
        
        db.commit()
        print(f"[workers] Deleted {deleted} old cache entries")
        return deleted
    except Exception as e:
        db.rollback()
        print(f"[workers] Cache cleanup error: {e}")
        return 0
    finally:
        db.close()


async def daily_worker_cycle():
    """
    Run once per day (e.g., via cron or external scheduler).
    This just orchestrates other tasks.
    """
    print(f"[workers] Daily worker cycle started at {datetime.utcnow().isoformat()}")

    # Run tasks in sequence
    await nightly_sam_scan()
    await nightly_embeddings_rebuild()
    await cleanup_old_search_cache()

    print(f"[workers] Daily worker cycle finished at {datetime.utcnow().isoformat()}")


# Celery task wrapper (optional)
# Uncomment when ready to use Celery:
# from workers.worker import celery_app
#
# @celery_app.task
# def run_daily_worker():
#     asyncio.run(daily_worker_cycle())

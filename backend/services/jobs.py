"""
Job Queue Service

Provides reliable background job execution with:
- Redis + RQ for job queue (optional - gracefully degrades without Redis)
- Automatic retries with exponential backoff
- Job run tracking in database
- Detailed event logging

Usage:
    from backend.services.jobs import enqueue

    enqueue(
        job_name="send_alerts",
        func_path="backend.jobs.run_alerts.run",
        payload={"frequency": "daily"},
        max_retries=3
    )
"""

import os
from datetime import datetime

try:
    from services.db import supabase
except ImportError:
    from backend.services.db import supabase

redis_url = os.getenv("REDIS_URL")
q = None

if redis_url:
    try:
        from redis import Redis
        from rq import Queue
        q = Queue(connection=Redis.from_url(redis_url))
        print("[Sturgeon AI] Redis job queue connected")
    except Exception as e:
        print(f"[Sturgeon AI] WARNING: Redis connection failed: {e}. Job queue disabled.")
else:
    print("[Sturgeon AI] WARNING: REDIS_URL not set. Background job queue disabled. Jobs will run inline.")


def log_event(job_run_id: str, level: str, message: str, meta: dict = None):
    """
    Log an event for a job run.
    """
    try:
        supabase.table("job_events").insert({
            "job_run_id": job_run_id,
            "level": level,
            "message": message,
            "meta": meta or {}
        }).execute()
    except Exception as e:
        print(f"Failed to log event: {e}")


def create_job_run(job_name: str) -> str:
    """
    Create a new job run record.
    Returns job_run_id (UUID).
    """
    row = supabase.table("job_runs").insert({
        "job_name": job_name,
        "status": "queued"
    }).execute().data[0]
    return row["id"]


def update_job_run(job_run_id: str, **fields):
    """Update a job run record."""
    try:
        supabase.table("job_runs").update(fields).eq("id", job_run_id).execute()
    except Exception as e:
        print(f"Failed to update job run: {e}")


def enqueue(job_name: str, func_path: str, payload: dict, max_retries: int = 3):
    """
    Enqueue a background job.

    If Redis is available, uses RQ for async processing.
    If Redis is not available, logs the job as pending (can be picked up by a cron worker).
    """
    job_run_id = create_job_run(job_name)

    if q is not None:
        q.enqueue(
            "backend.tasks.dispatch",
            job_name,
            job_run_id,
            func_path,
            payload,
            max_retries
        )
        return {"job_run_id": job_run_id, "status": "queued", "queue": "redis"}

    # No Redis — mark as pending for manual/cron pickup
    log_event(job_run_id, "info", f"Job queued without Redis. func_path={func_path}")
    update_job_run(job_run_id, status="pending", meta={"func_path": func_path, "payload": payload})
    return {"job_run_id": job_run_id, "status": "pending", "queue": "database"}

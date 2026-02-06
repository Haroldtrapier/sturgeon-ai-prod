"""
Job Queue Service

Provides reliable background job execution with:
- Redis + RQ for job queue
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
from redis import Redis
from rq import Queue
from backend.services.db import supabase

redis_url = os.getenv("REDIS_URL")
if not redis_url:
    raise Exception("REDIS_URL environment variable required")

q = Queue(connection=Redis.from_url(redis_url))


def log_event(job_run_id: str, level: str, message: str, meta: dict = None):
    """
    Log an event for a job run.
    
    Args:
        job_run_id: UUID of job run
        level: info | warn | error
        message: Event message
        meta: Optional metadata dict
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
    
    Returns:
        job_run_id (UUID)
    """
    row = supabase.table("job_runs").insert({
        "job_name": job_name,
        "status": "queued"
    }).execute().data[0]
    return row["id"]


def update_job_run(job_run_id: str, **fields):
    """
    Update a job run record.
    
    Args:
        job_run_id: UUID of job run
        **fields: Fields to update (status, attempts, last_error, etc.)
    """
    try:
        supabase.table("job_runs").update(fields).eq("id", job_run_id).execute()
    except Exception as e:
        print(f"Failed to update job run: {e}")


def enqueue(job_name: str, func_path: str, payload: dict, max_retries: int = 3):
    """
    Enqueue a background job.
    
    Args:
        job_name: Human-readable job name (e.g., "send_daily_alerts")
        func_path: Python path to function (e.g., "backend.jobs.run_alerts.run")
        payload: Dict of arguments to pass to function
        max_retries: Maximum retry attempts (default 3)
        
    Returns:
        dict with job_run_id
    """
    job_run_id = create_job_run(job_name)
    
    q.enqueue(
        "backend.tasks.dispatch",
        job_name,
        job_run_id,
        func_path,
        payload,
        max_retries
    )
    
    return {"job_run_id": job_run_id, "status": "queued"}

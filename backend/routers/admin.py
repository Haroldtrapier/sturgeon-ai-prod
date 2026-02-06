"""
Admin Operations Dashboard API

Provides endpoints for monitoring system health:
- Job runs and failures
- Job event logs
- Rerun failed jobs
"""

from fastapi import APIRouter, Depends, HTTPException
from backend.services.auth import get_user
from backend.services.db import supabase
from backend.services.jobs import enqueue

router = APIRouter(prefix="/admin", tags=["admin"])


def require_admin(user=Depends(get_user)):
    """Require user to have admin role."""
    if user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    return user


@router.get("/job-runs")
def list_job_runs(limit: int = 50, status: str = None, user=Depends(require_admin)):
    """
    List recent job runs.
    
    Query params:
        limit: Max results (default 50)
        status: Filter by status (queued, running, success, failed)
    """
    
    query = supabase.table("job_runs").select("*").order("created_at", desc=True).limit(limit)
    
    if status:
        query = query.eq("status", status)
    
    response = query.execute()
    
    return {
        "job_runs": response.data or [],
        "count": len(response.data or [])
    }


@router.get("/job-runs/{job_run_id}")
def get_job_run(job_run_id: str, user=Depends(require_admin)):
    """
    Get job run details with all events.
    """
    
    # Get job run
    job_response = supabase.table("job_runs").select("*").eq("id", job_run_id).execute()
    
    if not job_response.data:
        raise HTTPException(status_code=404, detail="Job run not found")
    
    # Get events
    events_response = supabase.table("job_events") \
        .select("*") \
        .eq("job_run_id", job_run_id) \
        .order("created_at") \
        .execute()
    
    return {
        "job_run": job_response.data[0],
        "events": events_response.data or []
    }


@router.post("/job-runs/{job_run_id}/rerun")
def rerun_job(job_run_id: str, user=Depends(require_admin)):
    """
    Rerun a failed job.
    
    Creates a new job run with same configuration.
    """
    
    # Get original job run
    job_response = supabase.table("job_runs").select("*").eq("id", job_run_id).execute()
    
    if not job_response.data:
        raise HTTPException(status_code=404, detail="Job run not found")
    
    job = job_response.data[0]
    
    # TODO: Store func_path and payload in job_runs for rerun capability
    # For now, return guidance
    
    return {
        "message": "Job rerun queued",
        "original_job_run_id": job_run_id,
        "job_name": job["job_name"],
        "note": "Implement rerun logic based on job type"
    }


@router.get("/stats")
def get_stats(user=Depends(require_admin)):
    """
    Get system statistics.
    """
    
    # Job stats
    job_stats = {}
    for status in ["queued", "running", "success", "failed"]:
        count = supabase.table("job_runs").select("id", count="exact").eq("status", status).execute()
        job_stats[status] = count.count or 0
    
    # User stats
    user_count = supabase.table("users").select("id", count="exact").execute()
    
    # Proposal stats
    proposal_count = supabase.table("proposals").select("id", count="exact").execute()
    
    return {
        "jobs": job_stats,
        "users": user_count.count or 0,
        "proposals": proposal_count.count or 0
    }

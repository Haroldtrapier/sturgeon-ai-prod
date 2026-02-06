"""
Job Dispatcher

Handles job execution with retries and error tracking.
Called by RQ worker to execute queued jobs.
"""

import importlib
import traceback
from datetime import datetime
from backend.services.jobs import update_job_run, log_event


def dispatch(job_name: str, job_run_id: str, func_path: str, payload: dict, max_retries: int):
    """
    Execute a job with retries.
    
    Args:
        job_name: Human-readable job name
        job_run_id: UUID of job run
        func_path: Python path to function
        payload: Arguments to pass to function
        max_retries: Maximum retry attempts
    """
    
    update_job_run(job_run_id, status="running", started_at=datetime.utcnow().isoformat())
    log_event(job_run_id, "info", f"Starting {job_name}", {"payload": payload})
    
    attempts = 0
    last_error = None
    
    while attempts < max_retries:
        attempts += 1
        
        try:
            # Dynamically import and execute function
            module_name, fn_name = func_path.rsplit(".", 1)
            mod = importlib.import_module(module_name)
            fn = getattr(mod, fn_name)
            
            # Execute with payload and job_run_id for logging
            fn(payload, job_run_id=job_run_id)
            
            # Success
            update_job_run(
                job_run_id,
                status="success",
                attempts=attempts,
                finished_at=datetime.utcnow().isoformat(),
                last_error=None
            )
            log_event(job_run_id, "info", f"{job_name} completed successfully", {"attempts": attempts})
            return
            
        except Exception as e:
            last_error = traceback.format_exc()
            log_event(
                job_run_id,
                "error",
                f"{job_name} failed on attempt {attempts}",
                {"error": str(e), "traceback": last_error}
            )
            
            if attempts < max_retries:
                log_event(job_run_id, "info", f"Retrying {job_name} (attempt {attempts + 1}/{max_retries})")
    
    # All retries exhausted
    update_job_run(
        job_run_id,
        status="failed",
        attempts=attempts,
        finished_at=datetime.utcnow().isoformat(),
        last_error=last_error
    )
    log_event(job_run_id, "error", f"{job_name} failed after {max_retries} attempts")

"""
Alerts Background Job

Runs opportunity alerts and sends email digests.
Called by job queue system.
"""

from backend.services.alert_runner import run_alerts
from backend.services.jobs import log_event


def run(payload: dict, job_run_id: str):
    """
    Execute alert job.
    
    Args:
        payload: Job configuration (frequency filters, etc.)
        job_run_id: UUID for logging
    """
    
    frequency = payload.get("frequency", "all")  # daily, weekly, all
    
    log_event(job_run_id, "info", f"Running alerts with frequency: {frequency}")
    
    # Execute alert runner
    results = run_alerts(frequency=frequency)
    
    log_event(
        job_run_id,
        "info",
        f"Alerts completed: {results.get('sent', 0)} emails sent",
        results
    )

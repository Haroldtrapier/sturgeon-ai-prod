"""
Background job scheduler for Sturgeon AI.
Handles automated opportunity syncing, deadline reminders, and data updates.
"""
import os
import asyncio
from datetime import datetime, timedelta
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.cron import CronTrigger


scheduler = AsyncIOScheduler()


async def sync_sam_opportunities():
    """Daily sync of new SAM.gov opportunities into the database."""
    print(f"[Jobs] Starting SAM.gov opportunity sync at {datetime.utcnow()}")

    try:
        from services.sam_gov import sam_client
        from services.db import upsert_opportunity

        from_date = (datetime.utcnow() - timedelta(days=1)).strftime("%Y-%m-%d")
        to_date = datetime.utcnow().strftime("%Y-%m-%d")

        result = await sam_client.search_opportunities(
            posted_from=from_date,
            posted_to=to_date,
            limit=100,
        )

        imported = 0
        for opp in result.get("opportunities", []):
            if not opp.get("id"):
                continue
            data = {
                "notice_id": opp["id"],
                "title": opp.get("title", "Untitled"),
                "agency": opp.get("department", ""),
                "office": opp.get("office", ""),
                "naics_code": opp.get("naics_code", ""),
                "set_aside": opp.get("set_aside", ""),
                "posted_date": opp.get("posted_date"),
                "response_deadline": opp.get("response_deadline"),
                "description": opp.get("description", ""),
                "source": "SAM.gov",
                "status": "active",
            }
            upsert_opportunity(data)
            imported += 1

        print(f"[Jobs] SAM.gov sync complete: {imported} opportunities imported")
    except Exception as e:
        print(f"[Jobs] SAM.gov sync error: {e}")


async def send_deadline_reminders():
    """Send notifications for opportunities with approaching deadlines."""
    print(f"[Jobs] Checking deadline reminders at {datetime.utcnow()}")

    try:
        from services.db import supabase, create_notification

        # Find saved opportunities with deadlines in the next 7 days
        deadline_cutoff = (datetime.utcnow() + timedelta(days=7)).isoformat()
        today = datetime.utcnow().isoformat()

        result = supabase.table("saved_opportunities") \
            .select("*, opportunities(*)") \
            .execute()

        notifications_sent = 0
        for saved in (result.data or []):
            opp = saved.get("opportunities", {})
            if not opp:
                continue

            deadline = opp.get("response_deadline")
            if not deadline:
                continue

            # Check if deadline is within 7 days
            try:
                deadline_dt = datetime.fromisoformat(str(deadline).replace("Z", "+00:00").replace("+00:00", ""))
                days_until = (deadline_dt - datetime.utcnow()).days

                if 0 < days_until <= 7:
                    create_notification({
                        "user_id": saved["user_id"],
                        "type": "deadline_reminder",
                        "title": f"Deadline in {days_until} days",
                        "message": f"{opp.get('title', 'Opportunity')} deadline: {deadline}",
                        "is_read": False,
                        "link_url": f"/opportunities/{opp.get('id', '')}",
                    })
                    notifications_sent += 1
            except (ValueError, TypeError):
                continue

        print(f"[Jobs] Sent {notifications_sent} deadline reminders")
    except Exception as e:
        print(f"[Jobs] Deadline reminder error: {e}")


async def update_contract_history():
    """Weekly update of FPDS contract award data."""
    print(f"[Jobs] Starting contract history update at {datetime.utcnow()}")

    try:
        from integrations.fpds_client import fpds_client
        from services.db import upsert_contract

        # Search recent awards
        result = await fpds_client.search_contracts(
            fiscal_year=datetime.utcnow().year,
            limit=100,
        )

        imported = 0
        for award in result.get("results", []):
            if not award.get("contract_id"):
                continue
            data = {
                "contract_id": award["contract_id"],
                "vendor_name": award.get("vendor_name", ""),
                "agency": award.get("agency", ""),
                "department": award.get("sub_agency", ""),
                "award_amount": award.get("award_amount"),
                "award_date": award.get("start_date"),
                "naics_code": award.get("naics_code", ""),
                "psc_code": award.get("psc_code", ""),
                "description": award.get("description", ""),
                "source": "FPDS",
            }
            upsert_contract(data)
            imported += 1

        print(f"[Jobs] Contract history update complete: {imported} contracts imported")
    except Exception as e:
        print(f"[Jobs] Contract history update error: {e}")


async def archive_expired_opportunities():
    """Archive opportunities past their response deadline."""
    print(f"[Jobs] Archiving expired opportunities at {datetime.utcnow()}")

    try:
        from services.db import supabase

        today = datetime.utcnow().isoformat()
        supabase.table("opportunities") \
            .update({"status": "archived"}) \
            .eq("status", "active") \
            .lt("response_deadline", today) \
            .execute()

        print("[Jobs] Expired opportunities archived")
    except Exception as e:
        print(f"[Jobs] Archive error: {e}")


def start_scheduler():
    """Initialize and start the background job scheduler."""
    # Daily at 1 AM UTC - Sync SAM.gov opportunities
    scheduler.add_job(
        sync_sam_opportunities,
        CronTrigger(hour=1, minute=0),
        id="sync_sam_opportunities",
        replace_existing=True,
    )

    # Daily at 9 AM UTC - Send deadline reminders
    scheduler.add_job(
        send_deadline_reminders,
        CronTrigger(hour=9, minute=0),
        id="send_deadline_reminders",
        replace_existing=True,
    )

    # Weekly on Monday at 2 AM UTC - Update contract history
    scheduler.add_job(
        update_contract_history,
        CronTrigger(day_of_week="mon", hour=2, minute=0),
        id="update_contract_history",
        replace_existing=True,
    )

    # Daily at 3 AM UTC - Archive expired opportunities
    scheduler.add_job(
        archive_expired_opportunities,
        CronTrigger(hour=3, minute=0),
        id="archive_expired_opportunities",
        replace_existing=True,
    )

    scheduler.start()
    print("[Jobs] Background scheduler started with 4 jobs")


def stop_scheduler():
    """Stop the background scheduler."""
    if scheduler.running:
        scheduler.shutdown()
        print("[Jobs] Background scheduler stopped")

# backend/workers/worker.py

import asyncio
from workers.tasks import daily_worker_cycle

if __name__ == "__main__":
    # Simple CLI entrypoint; you can call this from cron:
    # 0 3 * * * /usr/bin/python -m backend.workers.worker
    asyncio.run(daily_worker_cycle())

import os
from redis import Redis
from rq import Worker, Queue, Connection

listen = ["default"]
redis_url = os.getenv("REDIS_URL")

if not redis_url:
    raise Exception("REDIS_URL environment variable is required for worker")

conn = Redis.from_url(redis_url)

if __name__ == "__main__":
    with Connection(conn):
        worker = Worker([Queue(name) for name in listen])
        print(f"Worker listening on queues: {listen}")
        worker.work()

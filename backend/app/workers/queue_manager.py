"""
RQ Queue Manager.
Enqueues tasks for workers.
"""
from app.redis_client import get_discovery_queue, get_scrape_queue
from bson import ObjectId

async def enqueue_discovery(project_id: str, source_id: str):
    """Enqueue a discovery crawl task"""
    queue = get_discovery_queue()
    job = queue.enqueue(
        "app.workers.tasks.discovery_task",
        project_id=project_id,
        source_id=source_id,
        job_timeout="5m"
    )
    return job.id

async def enqueue_full_scrape(project_id: str, source_id: str):
    """Enqueue a full scrape task"""
    queue = get_scrape_queue()
    job = queue.enqueue(
        "app.workers.tasks.full_scrape_task",
        project_id=project_id,
        source_id=source_id,
        job_timeout="30m"
    )
    return job.id

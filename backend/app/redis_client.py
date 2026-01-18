"""
Redis connection for RQ job queues.
"""
import redis
from rq import Queue
from .config import settings


# Redis connection
redis_conn = redis.from_url(settings.redis_url, decode_responses=False)

# RQ Queues
discovery_queue = Queue(settings.rq_queue_discovery, connection=redis_conn)
scrape_queue = Queue(settings.rq_queue_scrape, connection=redis_conn)


def get_redis_connection():
    """Get Redis connection instance"""
    return redis_conn


def get_discovery_queue() -> Queue:
    """Get discovery queue"""
    return discovery_queue


def get_scrape_queue() -> Queue:
    """Get scraping queue"""
    return scrape_queue

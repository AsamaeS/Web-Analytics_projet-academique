"""
Retry logic decorators using tenacity.
"""
from tenacity import retry, stop_after_attempt, wait_exponential, retry_if_exception_type
import httpx
import logging

logger = logging.getLogger(__name__)

def get_retry_decorator(max_attempts: int = 3, min_wait: float = 1.0, max_wait: float = 10.0):
    """
    Get a configured retry decorator.
    Retries on network errors and 5xx status codes (if raised as exceptions).
    """
    return retry(
        stop=stop_after_attempt(max_attempts),
        wait=wait_exponential(multiplier=1, min=min_wait, max=max_wait),
        retry=retry_if_exception_type((httpx.RequestError, httpx.TimeoutException, ConnectionError)),
        reraise=True
    )

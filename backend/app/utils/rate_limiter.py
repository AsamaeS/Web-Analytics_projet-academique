"""
Per-domain rate limiting with adaptive delays.
"""
import asyncio
from urllib.parse import urlparse
from typing import Dict
from datetime import datetime, timedelta


class RateLimiter:
    """Per-domain rate limiter with adaptive delays"""
    
    def __init__(self, default_delay: float = 2.0):
        self.default_delay = default_delay
        self.delays: Dict[str, float] = {}
        self.last_request: Dict[str, datetime] = {}
    
    def _get_domain(self, url: str) -> str:
        """Extract domain from URL"""
        parsed = urlparse(url)
        return parsed.netloc
    
    async def wait(self, url: str):
        """Wait appropriate time before next request to domain"""
        domain = self._get_domain(url)
        
        # Get delay for this domain
        delay = self.delays.get(domain, self.default_delay)
        
        # Check last request time
        if domain in self.last_request:
            elapsed = (datetime.utcnow() - self.last_request[domain]).total_seconds()
            if elapsed < delay:
                await asyncio.sleep(delay - elapsed)
        
        # Update last request time
        self.last_request[domain] = datetime.utcnow()
    
    def increase_delay(self, url: str, factor: float = 2.0):
        """Increase delay for a domain (e.g., after 429 response)"""
        domain = self._get_domain(url)
        current_delay = self.delays.get(domain, self.default_delay)
        new_delay = min(current_delay * factor, 60.0)  # Max 60s
        self.delays[domain] = new_delay
    
    def decrease_delay(self, url: str, factor: float = 0.8):
        """Decrease delay for a domain (after successful requests)"""
        domain = self._get_domain(url)
        current_delay = self.delays.get(domain, self.default_delay)
        new_delay = max(current_delay * factor, self.default_delay)
        self.delays[domain] = new_delay

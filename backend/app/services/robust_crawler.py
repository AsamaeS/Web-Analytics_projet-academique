"""
Robust Crawler Service.
Production-grade crawler with anti-blocking strategies.
"""
import asyncio
import random
from typing import Optional
from playwright.async_api import async_playwright, TimeoutError as PlaywrightTimeout
import httpx
from tenacity import retry, stop_after_attempt, wait_exponential
from app.utils.user_agents import USER_AGENTS
from app.utils.rate_limiter import RateLimiter
from app.models.source import Source

class RobustCrawler:
    """
    Crawler with exponential backoff, UA rotation, and Playwright fallback.
    """
    
    def __init__(self, source: dict, config: dict):
        self.source = source
        self.config = config
        self.rate_limiter = RateLimiter()
    
    @retry(
        stop=stop_after_attempt(5),
        wait=wait_exponential(multiplier=1, min=2, max=60),
        reraise=True
    )
    async def fetch(self, url: str) -> Optional[str]:
        """
        Fetch page with fallback logic.
        """
        
        # 1. Rate limiting
        await self.rate_limiter.wait(url)
        
        # 2. Jitter
        await asyncio.sleep(random.uniform(2.0, 5.0))
        
        # 3. Try httpx first
        html = await self._fetch_with_httpx(url)
        
        # 4. Fallback to Playwright if needed
        if html is None or self._is_cloudflare(html):
            print(f"[Crawler] Switching to Playwright for {url}")
            html = await self._fetch_with_playwright(url)
        
        # 5. Check Captcha
        if html and self._detect_captcha(html):
            print(f"[Crawler] CAPTCHA detected on {url}")
            return None
            
        return html
    
    async def _fetch_with_httpx(self, url: str) -> Optional[str]:
        try:
            ua = random.choice(USER_AGENTS)
            headers = {
                "User-Agent": ua,
                "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
                "Accept-Language": "en-US,en;q=0.9,fr;q=0.8",
                # "Accept-Encoding": "gzip, deflate, br", # Let httpx handle this automatically
                "Connection": "keep-alive",
                "Upgrade-Insecure-Requests": "1",
                "Sec-Fetch-Dest": "document",
                "Sec-Fetch-Mode": "navigate",
                "Sec-Fetch-Site": "none",
                "Sec-Fetch-User": "?1",
                "Cache-Control": "max-age=0",
                "DNT": "1"
            }
            
            async with httpx.AsyncClient(
                timeout=self.config.get("timeout_seconds", 30),
                follow_redirects=True,
                verify=self.config.get("verify_ssl", True)
            ) as client:
                response = await client.get(url, headers=headers)
                
                if response.status_code == 200:
                    return response.text
                elif response.status_code == 429:
                    self.rate_limiter.increase_delay(url)
                    raise Exception("Rate limited")
                elif response.status_code == 403:
                    return None # Trigger fallback
                
                return None
                
        except Exception as e:
            print(f"[Crawler] HTTP error {url}: {e}")
            return None

    async def _fetch_with_playwright(self, url: str) -> Optional[str]:
        try:
            async with async_playwright() as p:
                browser = await p.chromium.launch(headless=True)
                context = await browser.new_context(
                    user_agent=random.choice(USER_AGENTS),
                    viewport={'width': 1920, 'height': 1080},
                    locale="en-US",
                    timezone_id="America/New_York",
                    permissions=["geolocation"],
                    geolocation={"latitude": 40.7128, "longitude": -74.0060},
                    java_script_enabled=True,
                    has_touch=False
                )
                page = await context.new_page()
                
                await page.goto(url, timeout=30000, wait_until='domcontentloaded')
                await asyncio.sleep(3) # Wait for JS
                
                html = await page.content()
                await browser.close()
                return html
        except Exception as e:
            print(f"[Crawler] Playwright error {url}: {e}")
            return None

    def _is_cloudflare(self, html: str) -> bool:
        indicators = ["cf-browser-verification", "cloudflare-static", "Just a moment..."]
        return any(i in html for i in indicators)

    def _detect_captcha(self, html: str) -> bool:
        patterns = ["recaptcha", "hcaptcha", "captcha-container"]
        return any(p in html.lower() for p in patterns)

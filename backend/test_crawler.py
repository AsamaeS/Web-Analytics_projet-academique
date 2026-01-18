import asyncio
import os
import sys

# Ensure app is in path
sys.path.append('/app')

from app.services.robust_crawler import RobustCrawler

async def test_crawl():
    print("Starting test crawl...")
    source = {"url": "https://www.iea.org", "config": {"verify_ssl": True}}
    crawler = RobustCrawler(source, source["config"])
    
    url = "https://www.iea.org"
    print(f"Fetching {url}...")
    try:
        html = await crawler.fetch(url)
        if html:
            print(f"SUCCESS: Fetched {len(html)} bytes")
            print("Preview:", html[:200])
        else:
            print("FAILURE: fetch returned None")
    except Exception as e:
        print(f"EXCEPTION: {e}")

if __name__ == "__main__":
    asyncio.run(test_crawl())

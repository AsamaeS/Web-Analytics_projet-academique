import asyncio
import os
import httpx

async def trigger():
    project_id = "696ae030b58e1601d7f0d845"
    sources = ["696ae20d7a8e06f5a6bc8074", "696ae2247a8e06f5a6bc8075"]
    
    async with httpx.AsyncClient() as client:
        resp = await client.post(
            f"http://localhost:8000/api/projects/{project_id}/crawl/full",
            json=sources,
            timeout=10
        )
        print(f"Status: {resp.status_code}")
        print(f"Response: {resp.text}")

if __name__ == "__main__":
    asyncio.run(trigger())

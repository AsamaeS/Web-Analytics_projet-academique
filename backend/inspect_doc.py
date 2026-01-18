import asyncio
import os
from motor.motor_asyncio import AsyncIOMotorClient
from app.config import settings

async def inspect():
    client = AsyncIOMotorClient(settings.mongodb_url)
    db = client[settings.mongodb_db_name]
    
    doc = await db.scraped_content.find_one({}, sort=[("crawled_at", -1)])
    if doc:
        print(f"Title: {doc.get('title')}")
        print(f"URL: {doc.get('url')}")
        print("-" * 20)
        print(doc.get('content'))
        print("-" * 20)
        print(f"Keywords detected: {doc.get('keywords_detected')}")
        print(f"Relevance: {doc.get('features', {}).get('relevance_score')}")
    else:
        print("No documents found.")
    
    client.close()

if __name__ == "__main__":
    asyncio.run(inspect())

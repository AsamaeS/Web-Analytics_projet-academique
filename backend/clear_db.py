import asyncio
import os
from motor.motor_asyncio import AsyncIOMotorClient
from app.config import settings

async def clear_data():
    client = AsyncIOMotorClient(settings.mongodb_url)
    db = client[settings.mongodb_db_name]
    
    # Delete docs with 0 relevance or binary content signatures
    res = await db.scraped_content.delete_many({})
    print(f"Cleared {res.deleted_count} documents from scraped_content.")
    
    client.close()

if __name__ == "__main__":
    asyncio.run(clear_data())

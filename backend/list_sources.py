import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from app.config import settings

async def list_sources():
    client = AsyncIOMotorClient(settings.mongodb_url)
    db = client[settings.mongodb_db_name]
    sources = await db.sources.find({}).to_list(100)
    for s in sources:
        print(f"ID: {s['_id']} | Name: {s.get('name')} | URL: {s.get('url')}")
    client.close()

if __name__ == "__main__":
    asyncio.run(list_sources())

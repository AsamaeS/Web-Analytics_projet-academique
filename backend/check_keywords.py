import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from app.config import settings

async def check():
    client = AsyncIOMotorClient(settings.mongodb_url)
    db = client[settings.mongodb_db_name]
    p = await db.projects.find_one({})
    if p:
        print(f"Keywords for project {p['name']}:")
        print(p['keywords'])
    client.close()

if __name__ == "__main__":
    asyncio.run(check())

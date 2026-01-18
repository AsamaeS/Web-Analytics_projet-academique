import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from app.config import settings

async def check():
    client = AsyncIOMotorClient(settings.mongodb_url)
    db = client[settings.mongodb_db_name]
    projects = await db.projects.find({}).to_list(10)
    for p in projects:
        print(f"Project: {p['name']} | Type: {p.get('type')} | ID: {p['_id']}")
    client.close()

if __name__ == "__main__":
    asyncio.run(check())

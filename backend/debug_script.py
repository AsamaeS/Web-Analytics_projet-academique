import asyncio
from app.database import connect_to_database, get_database
from app.models.source import Source
from bson import ObjectId

async def debug_db():
    await connect_to_database()
    db = await get_database()
    
    print("--- JOBS ---")
    jobs = await db.crawl_jobs.find().sort("created_at", -1).limit(5).to_list(10)
    for job in jobs:
        print(f"Job {job['_id']} | Type: {job['type']} | Status: {job['status']} | Error: {job.get('error')}")

    print("\n--- SOURCES ---")
    sources = await db.sources.find().to_list(10)
    for s in sources:
        print(f"Source {s['name']} | Status: {s.get('status')} | Metric Rel: {s.get('metrics', {}).get('relevance_score')}")

    print("\n--- CONTENT ---")
    count = await db.scraped_content.count_documents({})
    print(f"Total Content Items: {count}")

if __name__ == "__main__":
    asyncio.run(debug_db())

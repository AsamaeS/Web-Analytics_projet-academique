import asyncio
import os
from motor.motor_asyncio import AsyncIOMotorClient
from app.config import settings

async def init_db():
    print(f"Connecting to {settings.mongodb_url}...")
    client = AsyncIOMotorClient(settings.mongodb_url)
    db = client[settings.mongodb_db_name]
    
    print("Creating Indexes...")
    try:
        # Drop existing index if conflict
        try:
            await db.scraped_content.drop_index("text_search_idx")
            print("Dropped old text_search_idx")
        except:
            pass

        # Text search indexes on scraped_content
        await db.scraped_content.create_index(
            [("content", "text"), ("title", "text")],
            weights={"title": 10, "content": 1},
            default_language="english",
            name="text_search_idx"
        )
        print("✓ Created text_search_idx")
        
        # Check data
        count = await db.scraped_content.count_documents({})
        print(f"Total Documents: {count}")
        
        if count > 0:
            doc = await db.scraped_content.find_one({}, sort=[("crawled_at", -1)])
            print(f"Sample Doc Title: {doc.get('title')}")
            content = doc.get('content', '')
            print(f"Sample Doc Content Length: {len(content)}")
            print(f"Sample Doc Content Preview: {content[:500]}...")
            print(f"Sample Doc Keywords Detected: {doc.get('keywords_detected')}")
            print(f"Sample Doc Features: {doc.get('features')}")
            
    except Exception as e:
        print(f"Error: {e}")
        
    client.close()

if __name__ == "__main__":
    asyncio.run(init_db())

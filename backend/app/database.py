"""
MongoDB database connection and initialization using Motor async driver.
"""
from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from .config import settings


class Database:
    """MongoDB database manager"""
    
    client: AsyncIOMotorClient = None
    db: AsyncIOMotorDatabase = None


db_instance = Database()


async def connect_to_database():
    """Establish connection to MongoDB and create indexes"""
    print(f"Connecting to MongoDB at {settings.mongodb_url}...")
    
    db_instance.client = AsyncIOMotorClient(settings.mongodb_url)
    db_instance.db = db_instance.client[settings.mongodb_db_name]
    
    # Create indexes
    await create_indexes()
    
    print("✓ MongoDB connected successfully")


async def close_database_connection():
    """Close MongoDB connection"""
    print("Closing MongoDB connection...")
    db_instance.client.close()
    print("✓ MongoDB connection closed")


async def create_indexes():
    """Create all required MongoDB indexes"""
    
    # Text search indexes on scraped_content
    try:
        await db_instance.db.scraped_content.create_index(
            [("content", "text"), ("title", "text")],
            weights={"title": 10, "content": 1},
            default_language="english",
            name="text_search_idx"
        )
    except Exception as e:
        print(f"Warning: Could not create text_search_idx: {e}")
        # Continue starting up even if index creation fails
    
    # Performance indexes for scraped_content
    await db_instance.db.scraped_content.create_index(
        [("project_id", 1), ("crawled_at", -1)],
        name="project_date_idx"
    )
    await db_instance.db.scraped_content.create_index(
        [("project_id", 1), ("features.relevance_score", -1)],
        name="project_relevance_idx"
    )
    
    # Indexes for sources
    await db_instance.db.sources.create_index(
        [("project_id", 1), ("status", 1)],
        name="project_status_idx"
    )
    await db_instance.db.sources.create_index(
        [("project_id", 1), ("metrics.relevance_score", -1)],
        name="source_relevance_idx"
    )
    
    # Indexes for crawl_jobs
    await db_instance.db.crawl_jobs.create_index(
        [("project_id", 1), ("status", 1), ("created_at", -1)],
        name="job_tracking_idx"
    )
    
    # TTL index for old crawl jobs (30 days)
    await db_instance.db.crawl_jobs.create_index(
        [("created_at", 1)],
        expireAfterSeconds=2592000,
        name="job_ttl_idx"
    )
    
    # Indexes for conversations
    await db_instance.db.llm_conversations.create_index(
        [("project_id", 1), ("updated_at", -1)],
        name="conversation_idx"
    )
    
    print("✓ MongoDB indexes created")


async def get_database() -> AsyncIOMotorDatabase:
    """Get database instance"""
    return db_instance.db

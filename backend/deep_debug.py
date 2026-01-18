import asyncio
import os
import sys

# Ensure backend modules are found
sys.path.append('/app')

from app.database import connect_to_database, get_database, close_database_connection
from app.services.llm_service import LLMService
from app.services.analytics_service import AnalyticsService
from bson import ObjectId

async def debug_system():
    print("--- 1. DATABASE CONNECTION ---")
    await connect_to_database()
    db = await get_database()
    print("Connected to MongoDB")

    print("\n--- 2. DATA INSPECTION ---")
    projects = await db.projects.find().to_list(10)
    if not projects:
        print("CRITICAL: No projects found!")
        return
    
    project = projects[0]
    pid = str(project["_id"])
    print(f"Project: {project['name']} (ID: {pid})")

    sources_count = await db.sources.count_documents({"project_id": pid})
    content_count = await db.scraped_content.count_documents({"project_id": pid})
    print(f"Sources: {sources_count}")
    print(f"Scraped Content: {content_count}")

    if content_count > 0:
        sample = await db.scraped_content.find_one({"project_id": pid})
        print(f"Sample Content: {sample.get('title', 'No Title')} (Len: {len(sample.get('content', ''))})")
        print(f"Features: {sample.get('features')}")
    else:
        print("WARNING: No content found. Crawling might have failed to save data.")

    print("\n--- 3. ANALYTICS SERVICE ---")
    analytics = AnalyticsService()
    try:
        overview = await analytics.get_overview(pid)
        print(f"Overview Data: {overview}")
    except Exception as e:
        print(f"Analytics Error: {e}")

    print("\n--- 4. LLM SERVICE (RAG) ---")
    llm = LLMService()
    query = "give me all the infos I need for my project"
    print(f"Testing RAG with query: '{query}'")
    
    try:
        # Test Search
        docs = await llm._search_documents(pid, query)
        print(f"Found {len(docs)} documents for context.")
        
        # Test Context Build
        context = llm._build_context(docs)
        print(f"Context built. Length: {len(context)}")
        
        # Test Generation (Simulated)
        if hasattr(llm, 'client') and llm.client:
             print("Groq Client initialized.")
        else:
             print("Groq Client NOT initialized (Check API Key).")

    except Exception as e:
        print(f"RAG Error: {e}")
        import traceback
        traceback.print_exc()

    await close_database_connection()

if __name__ == "__main__":
    asyncio.run(debug_system())

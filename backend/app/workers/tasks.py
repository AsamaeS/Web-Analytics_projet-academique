"""
RQ Tasks definition.
"""
import asyncio
from datetime import datetime
from bson import ObjectId
from app.database import connect_to_database, get_database, close_database_connection
from app.services.discovery_crawler import DiscoveryCrawler
from app.services.robust_crawler import RobustCrawler
from app.services.content_parser import ContentParser
from app.services.sentiment_analyzer import SentimentAnalyzer
from app.services.ner_extractor import NERExtractor
from app.services.relevance_calculator import RelevanceCalculator

# Async wrapper for RQ
def async_to_sync(func):
    def wrapper(*args, **kwargs):
        return asyncio.run(func(*args, **kwargs))
    return wrapper

@async_to_sync
async def discovery_task(project_id: str, source_id: str):
    """
    Discovery crawl task.
    """
    await connect_to_database()
    db = await get_database()
    
    try:
        project = await db.projects.find_one({"_id": ObjectId(project_id)})
        source = await db.sources.find_one({"_id": ObjectId(source_id)})
        
        if not project or not source:
            return

        # Create Job
        job_doc = {
            "project_id": ObjectId(project_id),
            "source_id": ObjectId(source_id),
            "type": "discovery",
            "status": "running",
            "started_at": datetime.utcnow(),
            "created_at": datetime.utcnow()
        }
        res = await db.crawl_jobs.insert_one(job_doc)
        job_id = res.inserted_id
        
        # Run Crawler
        crawler = DiscoveryCrawler(source, project["keywords"])
        metrics = await crawler.run()
        
        # Update Source
        await db.sources.update_one(
            {"_id": ObjectId(source_id)},
            {
                "$set": {
                    "metrics": {**source.get("metrics", {}), **metrics, "discovery_completed": True},
                    "status": "pending_discovery" if metrics["relevance_score"] < 0.3 else "active" # Auto-active if relevant? No, let user decide. Keep pending or ready.
                }
            }
        )
        
        # Mark completed
        # Status logic: user flow says "pending_discovery" -> user selects -> "active".
        # So after discovery, it stays pending or "discovered". 
        # Let's keep it 'pending_discovery' but with results ready.
        
        await db.crawl_jobs.update_one(
            {"_id": job_id},
            {
                "$set": {"status": "completed", "completed_at": datetime.utcnow(), "stats": crawler.results},
                "$push": {
                    "stats.recent_logs": f"[{datetime.utcnow().strftime('%H:%M:%S')}] Discovery completed. Score: {metrics['relevance_score']}"
                }
            }
        )

    except Exception as e:
        print(f"Discovery Task Error: {e}")
        # Mark error
        if 'job_id' in locals():
            await db.crawl_jobs.update_one(
                {"_id": job_id},
                {"$set": {"status": "failed", "error": str(e)}}
            )
    finally:
        await close_database_connection()


@async_to_sync
async def full_scrape_task(project_id: str, source_id: str):
    """
    Full scrape task.
    """
    await connect_to_database()
    db = await get_database()
    
    try:
        project = await db.projects.find_one({"_id": ObjectId(project_id)})
        source = await db.sources.find_one({"_id": ObjectId(source_id)})
        
        job_doc = {
            "project_id": ObjectId(project_id),
            "source_id": ObjectId(source_id),
            "type": "full_scrape",
            "status": "running",
            "started_at": datetime.utcnow(),
            "created_at": datetime.utcnow(),
            "stats": {"pages_scraped": 0, "errors": []}
        }
        res = await db.crawl_jobs.insert_one(job_doc)
        job_id = res.inserted_id
        
        crawler = RobustCrawler(source, source.get("config", {}))
        parser = ContentParser()
        sentiment = SentimentAnalyzer()
        ner = NERExtractor()
        relevance_calc = RelevanceCalculator()
        
        # Simple BFS or predefined list.
        # For prototype, reuse discovery logic or just scrape homepage + direct links.
        # Here we'll do a simple depth-1 scrape of discovery results or just homepage.
        # A real "RobustCrawler" might have its own traversal state.
        # Let's assume we scrape up to max_pages.
        
        visited = set()
        to_visit = [source["url"]]
        scraped_count = 0
        max_pages = source.get("config", {}).get("max_pages", 50)
        
        while to_visit and scraped_count < max_pages:
            url = to_visit.pop(0)
            if url in visited: continue
            
            html = await crawler.fetch(url)
            visited.add(url)
            
            if not html:
                await db.crawl_jobs.update_one(
                    {"_id": job_id},
                    {"$push": {"stats.errors": {"url": url, "error": "Fetch failed"}}}
                )
                continue
            
            parsed = parser.extract_content(html, source["url"], source.get("config", {}).get("selectors"))
            
            # Extract links for next iteration
            base_url = source["url"].rstrip('/')
            for link_obj in parsed["metadata"].get("internal_links", []):
                link_url = link_obj["url"]
                if link_url not in visited and link_url not in to_visit:
                    # Basic check: stay on same domain
                    if link_url.startswith(base_url):
                        to_visit.append(link_url)
            
            # NLP
            relevance = relevance_calc.calculate(parsed["content"], project["keywords"])
            
            # Filter low relevance pages? No, keep all but score them.
            
            sent_res = sentiment.analyze(parsed["content"])
            entities = ner.extract(parsed["content"])
            
            # Save
            content_doc = {
                "project_id": ObjectId(project_id),
                "source_id": ObjectId(source_id),
                "crawl_job_id": job_id,
                "url": url,
                "title": parsed["title"],
                "content": parsed["content"],
                "keywords_detected": [
                    k for k in project["keywords"] 
                    if k.lower() in parsed["content"].lower() or 
                    (len(k.split()) > 1 and sum(1 for w in k.lower().split() if len(w) > 2 and w in parsed["content"].lower()) >= len(k.lower().split()) - 1)
                ],
                "metadata": parsed["metadata"],
                "features": {
                    "sentiment": sent_res,
                    "entities": entities,
                    "relevance_score": relevance
                },
                "crawled_at": datetime.utcnow()
            }
            await db.scraped_content.insert_one(content_doc)
            scraped_count += 1
            
            # Update job stats
            await db.crawl_jobs.update_one(
                {"_id": job_id},
                {
                    "$inc": {"stats.pages_scraped": 1},
                    "$push": {
                        "stats.recent_logs": {
                            "$each": [f"[{datetime.utcnow().strftime('%H:%M:%S')}] Scraped: {url} (Matches: {len(content_doc['keywords_detected'])})"],
                            "$slice": -10 
                        },
                        "stats.last_scraped_items": {
                            "$each": [{
                                "url": url,
                                "title": content_doc["title"],
                                "matches": content_doc["keywords_detected"],
                                "timestamp": datetime.utcnow()
                            }],
                            "$slice": -5
                        }
                    }
                }
            )
            
        # Complete
        await db.crawl_jobs.update_one(
            {"_id": job_id},
            {"$set": {"status": "completed", "completed_at": datetime.utcnow()}}
        )

    except Exception as e:
        print(f"Scrape Task Error: {e}")
        if 'job_id' in locals():
            await db.crawl_jobs.update_one(
                {"_id": job_id},
                {"$set": {"status": "failed", "error": str(e)}}
            )
    finally:
        await close_database_connection()

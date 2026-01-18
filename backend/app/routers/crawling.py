"""
Crawling API Router.
"""
from fastapi import APIRouter, HTTPException, Body
from typing import List
from bson import ObjectId
from app.database import get_database
from app.workers.queue_manager import enqueue_discovery, enqueue_full_scrape

router = APIRouter(prefix="/api/projects", tags=["crawling"])

@router.post("/{project_id}/crawl/discovery")
async def start_discovery_crawl(project_id: str):
    """Start discovery crawl for all active/pending sources"""
    db = await get_database()
    
    # Check project
    if not await db.projects.find_one({"_id": ObjectId(project_id)}):
        raise HTTPException(404, "Project not found")
        
    # Get sources
    sources = await db.sources.find({
        "project_id": project_id,
        "status": {"$in": ["active", "pending_discovery"]}
    }).to_list(1000)
    
    if not sources:
        return {"message": "No sources to crawl", "job_ids": []}
        
    job_ids = []
    for source in sources:
        job_id = await enqueue_discovery(project_id, str(source["_id"]))
        if job_id:
            job_ids.append(job_id)
            # Update source status
            await db.sources.update_one(
                {"_id": source["_id"]},
                {"$set": {"status": "pending_discovery"}}
            )
            
    return {"message": f"Started {len(job_ids)} discovery jobs", "job_ids": job_ids}

@router.post("/{project_id}/crawl/full")
async def start_full_scrape(project_id: str, source_ids: List[str] = Body(...)):
    """Start full scrape for selected sources"""
    db = await get_database()
    
    if not await db.projects.find_one({"_id": ObjectId(project_id)}):
        raise HTTPException(404, "Project not found")

    job_ids = []
    for source_id in source_ids:
        # Validate source
        if await db.sources.find_one({"_id": ObjectId(source_id), "project_id": project_id}):
             job_id = await enqueue_full_scrape(project_id, source_id)
             if job_id:
                 job_ids.append(job_id)
                 await db.sources.update_one(
                     {"_id": ObjectId(source_id)},
                     {"$set": {"status": "active"}}
                 )
    
    return {"message": f"Started {len(job_ids)} scrape jobs", "job_ids": job_ids}

@router.get("/{project_id}/crawl/status")
async def get_crawl_status(project_id: str):
    """Get active jobs status"""
    db = await get_database()
    
    jobs = await db.crawl_jobs.find({
        "project_id": project_id,
        "status": {"$in": ["pending", "running"]}
    }).to_list(100)
    
    return {"active_jobs_count": len(jobs), "jobs": jobs}

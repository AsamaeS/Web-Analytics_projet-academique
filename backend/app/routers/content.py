"""
Content API Router.
"""
from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional
from app.database import get_database
from app.models.content import ScrapedContent
from bson import ObjectId

router = APIRouter(prefix="/api", tags=["content"])

@router.get("/projects/{project_id}/content", response_model=List[ScrapedContent])
async def list_content(
    project_id: str, 
    limit: int = 50, 
    skip: int = 0,
    search: Optional[str] = None
):
    """List or search scraped content"""
    db = await get_database()
    
    query = {"project_id": project_id}
    if search:
        query["$text"] = {"$search": search}
        
    cursor = db.scraped_content.find(query)
    
    if search:
        cursor.sort([("score", {"$meta": "textScore"})])
    else:
        cursor.sort("crawled_at", -1)
        
    content = await cursor.skip(skip).limit(limit).to_list(limit)
    return content

@router.get("/content/{id}", response_model=ScrapedContent)
async def get_content(id: str):
    """Get content details"""
    db = await get_database()
    content = await db.scraped_content.find_one({"_id": ObjectId(id)})
    if not content:
        raise HTTPException(404, "Content not found")
    return content

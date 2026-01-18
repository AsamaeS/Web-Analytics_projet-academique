"""
Sources API Router.
"""
from fastapi import APIRouter, HTTPException, Body
from typing import List
from app.database import get_database
from app.models.source import Source, SourceCreate, SourceUpdate
from bson import ObjectId
from datetime import datetime

router = APIRouter(prefix="/api", tags=["sources"])

@router.post("/projects/{project_id}/sources", response_model=Source)
async def create_source(project_id: str, source: SourceCreate = Body(...)):
    """Add a source to a project"""
    db = await get_database()
    
    # Check project exists
    if not await db.projects.find_one({"_id": ObjectId(project_id)}):
        raise HTTPException(404, "Project not found")
        
    source_dict = source.model_dump()
    source_dict["project_id"] = project_id # Ensure string
    
    result = await db.sources.insert_one(source_dict)
    return await db.sources.find_one({"_id": result.inserted_id})

@router.get("/projects/{project_id}/sources", response_model=List[Source])
async def list_sources(project_id: str):
    """List project sources"""
    db = await get_database()
    sources = await db.sources.find({"project_id": project_id}).to_list(1000)
    return sources

@router.get("/sources/{id}", response_model=Source)
async def get_source(id: str):
    """Get source details"""
    db = await get_database()
    source = await db.sources.find_one({"_id": ObjectId(id)})
    if not source:
        raise HTTPException(404, "Source not found")
    return source

@router.put("/sources/{id}", response_model=Source)
async def update_source(id: str, update: SourceUpdate = Body(...)):
    """Update source"""
    db = await get_database()
    update_data = {k: v for k, v in update.model_dump().items() if v is not None}
    
    if update_data:
        update_data["updated_at"] = datetime.utcnow()
        await db.sources.update_one(
            {"_id": ObjectId(id)},
            {"$set": update_data}
        )
        
    return await db.sources.find_one({"_id": ObjectId(id)})

@router.delete("/sources/{id}")
async def delete_source(id: str):
    """Delete source"""
    db = await get_database()
    result = await db.sources.delete_one({"_id": ObjectId(id)})
    if result.deleted_count == 0:
        raise HTTPException(404, "Source not found")
    return {"message": "Source deleted"}

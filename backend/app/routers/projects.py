"""
Projects API Router.
"""
from fastapi import APIRouter, HTTPException, Body, Depends
from typing import List
from app.database import get_database
from app.models.project import Project, ProjectCreate, ProjectUpdate, PyObjectId
from bson import ObjectId

router = APIRouter(prefix="/api/projects", tags=["projects"])

@router.post("/", response_model=Project)
async def create_project(project: ProjectCreate = Body(...)):
    """Create a new project"""
    db = await get_database()
    project_dict = project.model_dump()
    result = await db.projects.insert_one(project_dict)
    created_project = await db.projects.find_one({"_id": result.inserted_id})
    return created_project

@router.get("/", response_model=List[Project])
async def list_projects():
    """List all projects"""
    db = await get_database()
    projects = await db.projects.find().to_list(100)
    return projects

@router.get("/{id}", response_model=Project)
async def get_project(id: str):
    """Get project details"""
    db = await get_database()
    project = await db.projects.find_one({"_id": ObjectId(id)})
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return project

@router.put("/{id}", response_model=Project)
async def update_project(id: str, update: ProjectUpdate = Body(...)):
    """Update project"""
    db = await get_database()
    update_data = {k: v for k, v in update.model_dump().items() if v is not None}
    
    if update_data:
        update_data["updated_at"] = datetime.utcnow()
        result = await db.projects.update_one(
            {"_id": ObjectId(id)},
            {"$set": update_data}
        )
        if result.modified_count == 0:
             # Check if exists
            if not await db.projects.find_one({"_id": ObjectId(id)}):
                raise HTTPException(status_code=404, detail="Project not found")
                
    return await db.projects.find_one({"_id": ObjectId(id)})

@router.delete("/{id}")
async def delete_project(id: str):
    """Delete project and related data"""
    db = await get_database()
    project = await db.projects.find_one({"_id": ObjectId(id)})
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
        
    # Delete sources
    await db.sources.delete_many({"project_id": ObjectId(id)})
    # Delete content
    await db.scraped_content.delete_many({"project_id": ObjectId(id)})
    # Delete jobs
    await db.crawl_jobs.delete_many({"project_id": ObjectId(id)})
    # Delete project
    await db.projects.delete_one({"_id": ObjectId(id)})
    
    return {"message": "Project deleted successfully"}

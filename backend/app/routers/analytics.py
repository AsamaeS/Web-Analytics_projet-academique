"""
Analytics API Router.
"""
from fastapi import APIRouter
from app.services.analytics_service import AnalyticsService
from app.services.llm_service import LLMService
from app.database import get_database
from typing import Dict, Any, List
from pydantic import BaseModel

router = APIRouter(prefix="/api/projects/{project_id}/analytics", tags=["analytics"])
service = AnalyticsService()
llm_service = LLMService()

class CommentaryRequest(BaseModel):
    chart_type: str
    data: Any
    project_context: Dict[str, Any]

@router.get("/overview")
async def get_overview(project_id: str):
    return await service.get_overview(project_id)

@router.get("/timeline")
async def get_timeline(project_id: str):
    return await service.get_timeline(project_id)

@router.get("/relevance")
async def get_source_relevance(project_id: str):
    return await service.get_source_relevance(project_id)

@router.get("/recent-content")
async def get_recent_content(project_id: str, limit: int = 10):
    """Get recently scraped content"""
    from app.database import get_database
    from bson import ObjectId
    db = await get_database()
    cursor = db.scraped_content.find(
        {"project_id": ObjectId(project_id)},
        {"title": 1, "url": 1, "crawled_at": 1, "features.relevance_score": 1}
    ).sort("crawled_at", -1).limit(limit)
    
    items = await cursor.to_list(limit)
    # Convert ObjectIds
    for item in items:
        item["id"] = str(item["_id"])
        del item["_id"]
        
    return items

@router.get("/sentiment")
async def get_sentiment_distribution(project_id: str):
    return await service.get_sentiment_distribution(project_id)

@router.get("/keywords")
async def get_keyword_stats(project_id: str):
    return await service.get_keyword_stats(project_id)

@router.get("/entities")
async def get_entity_stats(project_id: str):
    return await service.get_entity_stats(project_id)


@router.get("/insights")
async def get_project_insights(project_id: str):
    """Generate global insights for the project"""
    from bson import ObjectId
    db = await get_database()
    
    # Get project details
    project = await db.projects.find_one({"_id": ObjectId(project_id)})
    if not project:
        return {"insights": [], "summary": "Project not found"}
        
    # Get doc count
    doc_count = await db.scraped_content.count_documents({"project_id": ObjectId(project_id)})
    
    return await llm_service.generate_insights(
        project_name=project["name"],
        project_type=project.get("type", "generic"),
        keywords=project.get("keywords", []),
        doc_count=doc_count
    )

@router.post("/commentary")
async def get_chart_commentary(project_id: str, request: CommentaryRequest):
    """Generate commentary for a specific chart"""
    from bson import ObjectId
    
    # 1. Fetch project context if not fully provided
    if not request.project_context or not request.project_context.get("name"):
        db = await get_database()
        project = await db.projects.find_one({"_id": ObjectId(project_id)})
        if project:
            request.project_context = {
                "name": project.get("name"),
                "type": project.get("type"),
                "description": project.get("description")
            }

    return {"commentary": await llm_service.generate_chart_commentary(
        chart_type=request.chart_type,
        data=request.data,
        project_context=request.project_context
    )}

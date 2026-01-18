"""
LLM Chat Router.
"""
from fastapi import APIRouter, HTTPException, Body
from fastapi.responses import StreamingResponse
from app.database import get_database
from app.services.llm_service import LLMService
from app.models.conversation import Message
from typing import List, Dict
from bson import ObjectId

router = APIRouter(prefix="/api/projects/{project_id}/chat", tags=["llm"])
llm_service = LLMService()

@router.post("/")
async def chat(
    project_id: str,
    message: str = Body(..., embed=True),
    conversation_history: List[dict] = Body(default=[], embed=True)
):
    """Stream chat response"""
    db = await get_database()
    project = await db.projects.find_one({"_id": ObjectId(project_id)})
    if not project:
        raise HTTPException(404, "Project not found")
        
    async def generator():
        async for chunk in llm_service.chat_stream(project, message, conversation_history):
            yield f"data: {{\"content\": \"{chunk}\"}}\n\n"
            
    return StreamingResponse(generator(), media_type="text/event-stream")

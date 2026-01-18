"""
Project model definitions.
"""
from pydantic import BaseModel, Field, GetCoreSchemaHandler
from pydantic_core import CoreSchema, core_schema
from typing import Optional, List, Literal, Any
from datetime import datetime
from bson import ObjectId

class PyObjectId(str):
    @classmethod
    def __get_pydantic_core_schema__(
        cls, _source_type: Any, _handler: GetCoreSchemaHandler
    ) -> CoreSchema:
        return core_schema.json_or_python_schema(
            json_schema=core_schema.str_schema(),
            python_schema=core_schema.union_schema([
                core_schema.is_instance_schema(ObjectId),
                core_schema.str_schema(),
            ]),
            serialization=core_schema.plain_serializer_function_ser_schema(
                lambda x: str(x)
            ),
        )


class ProjectSettings(BaseModel):
    """Project crawling and analysis settings"""
    crawl_frequency: Literal["daily", "weekly", "manual"] = "weekly"
    max_depth: int = Field(default=3, ge=1, le=5)
    respect_robots_txt: bool = True
    language: str = "fr"
    enable_llm_analysis: bool = True
    max_pages_per_source: int = Field(default=100, ge=10, le=1000)


class ProjectStats(BaseModel):
    """Project statistics"""
    total_sources: int = 0
    active_sources: int = 0
    paused_sources: int = 0
    failed_sources: int = 0
    total_documents: int = 0
    last_crawl_date: Optional[datetime] = None
    avg_relevance_score: float = 0.0
    total_keywords_detected: int = 0


class ProjectBase(BaseModel):
    """Base project model for creation/update"""
    name: str = Field(..., min_length=1, max_length=200)
    description: Optional[str] = None
    type: Literal["investment", "market_research", "strategic_watch", "competitive_intelligence"] = "investment"
    domain: Optional[str] = None
    keywords: List[str] = Field(default_factory=list)
    settings: ProjectSettings = Field(default_factory=ProjectSettings)


class ProjectCreate(ProjectBase):
    """Model for creating a new project"""
    pass


class ProjectUpdate(BaseModel):
    """Model for updating a project"""
    name: Optional[str] = Field(None, min_length=1, max_length=200)
    description: Optional[str] = None
    type: Optional[Literal["investment", "market_research", "strategic_watch", "competitive_intelligence"]] = None
    domain: Optional[str] = None
    keywords: Optional[List[str]] = None
    settings: Optional[ProjectSettings] = None


class Project(ProjectBase):
    """Complete project model with all fields"""
    id: PyObjectId = Field(alias="_id")
    stats: ProjectStats = Field(default_factory=ProjectStats)
    user_id: str = "default"
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True

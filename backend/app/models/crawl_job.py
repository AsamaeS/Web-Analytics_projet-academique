"""
Crawl job model definitions.
"""
from pydantic import BaseModel, Field
from typing import Optional, Dict, Any, List, Literal
from datetime import datetime
from bson import ObjectId


from app.models.project import PyObjectId

class JobError(BaseModel):
    """Error information for failed pages"""
    url: str
    error_type: str
    error_message: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)


class JobStats(BaseModel):
    """Job execution statistics"""
    pages_discovered: int = 0
    pages_scraped: int = 0
    pages_failed: int = 0
    bytes_downloaded: int = 0
    keywords_found: Dict[str, int] = Field(default_factory=dict)
    errors: List[JobError] = Field(default_factory=list)
    recent_logs: List[str] = Field(default_factory=list)
    last_scraped_items: List[Dict[str, Any]] = Field(default_factory=list)


class CrawlJobBase(BaseModel):
    """Base crawl job model"""
    project_id: str
    source_id: str
    type: Literal["discovery", "full_scrape"]
    priority: Literal["high", "normal", "low"] = "normal"


class CrawlJobCreate(CrawlJobBase):
    """Model for creating a crawl job"""
    pass


class CrawlJob(CrawlJobBase):
    """Complete crawl job model"""
    id: PyObjectId = Field(alias="_id")
    status: Literal["pending", "running", "completed", "failed", "cancelled"] = "pending"
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    duration_seconds: Optional[int] = None
    stats: JobStats = Field(default_factory=JobStats)
    worker_id: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True

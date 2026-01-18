"""
Source model definitions.
"""
from pydantic import BaseModel, Field, HttpUrl
from typing import Optional, Dict, Any, Literal, List
from datetime import datetime
from bson import ObjectId
from app.models.project import PyObjectId


class SourceConfig(BaseModel):
    """Source-specific configuration"""
    max_pages: int = Field(default=100, ge=1, le=1000)
    timeout_seconds: int = Field(default=30, ge=5, le=120)
    follow_redirects: bool = True
    max_redirects: int = Field(default=5, ge=1, le=10)
    verify_ssl: bool = True
    javascript_rendering: bool = False
    
    # Custom CSS selectors (optional)
    selectors: Dict[str, str] = Field(default_factory=dict)
    
    # Authentication (optional)
    auth: Dict[str, Any] = Field(default_factory=dict)
    
    # Custom headers (optional)
    headers: Dict[str, str] = Field(default_factory=dict)
    
    # Proxy configuration (optional)
    proxy: Dict[str, Any] = Field(default_factory=dict)


class SourceMetrics(BaseModel):
    """Source crawling metrics and scores"""
    # Crawling stats
    total_crawls: int = 0
    successful_crawls: int = 0
    failed_crawls: int = 0
    last_crawl_date: Optional[datetime] = None
    avg_response_time_ms: float = 0.0
    
    # Relevance metrics
    relevance_score: float = 0.0
    keywords_matched: int = 0
    keyword_density: float = 0.0
    content_quality_score: float = 0.0
    content_freshness_score: float = 0.0
    accessibility_score: float = 0.0
    
    # Discovery results
    discovery_completed: bool = False
    discovery_date: Optional[datetime] = None
    sample_pages_analyzed: int = 0
    top_keywords_found: Dict[str, int] = Field(default_factory=dict)


class SourceBase(BaseModel):
    """Base source model"""
    name: str = Field(..., min_length=1, max_length=200)
    type: Literal["website", "rss", "api", "social_media"] = "website"
    url: str = Field(..., min_length=1)
    config: SourceConfig = Field(default_factory=SourceConfig)


class SourceCreate(SourceBase):
    """Model for creating a new source"""
    project_id: Optional[str] = None


class SourceUpdate(BaseModel):
    """Model for updating a source"""
    name: Optional[str] = Field(None, min_length=1, max_length=200)
    type: Optional[Literal["website", "rss", "api", "social_media"]] = None
    url: Optional[str] = None
    status: Optional[Literal["active", "paused", "failed", "blocked", "pending_discovery"]] = None
    config: Optional[SourceConfig] = None


class Source(SourceBase):
    """Complete source model"""
    id: PyObjectId = Field(alias="_id")
    project_id: str
    status: Literal["active", "paused", "failed", "blocked", "pending_discovery"] = "pending_discovery"
    metrics: SourceMetrics = Field(default_factory=SourceMetrics)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True

"""
Scraped content model definitions.
"""
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any, Literal
from datetime import datetime
from bson import ObjectId


from app.models.project import PyObjectId

class SentimentResult(BaseModel):
    """Sentiment analysis result"""
    score: float = Field(..., ge=-1.0, le=1.0)
    label: Literal["positive", "neutral", "negative"]
    confidence: float = Field(..., ge=0.0, le=1.0)


class EntityResult(BaseModel):
    """Named entity recognition result"""
    text: str
    type: str  # ORG, GPE, PERSON, MONEY, etc.
    count: int = 1


class ContentFeatures(BaseModel):
    """NLP and analysis features"""
    sentiment: Optional[SentimentResult] = None
    entities: List[EntityResult] = Field(default_factory=list)
    topics: List[str] = Field(default_factory=list)
    relevance_score: float = Field(default=0.0, ge=0.0, le=1.0)


class ContentMetadata(BaseModel):
    """Content metadata"""
    author: Optional[str] = None
    publish_date: Optional[datetime] = None
    language: str = "fr"
    word_count: int = 0
    images: List[Dict[str, str]] = Field(default_factory=list)
    outbound_links: List[Dict[str, str]] = Field(default_factory=list)
    http_status: int = 200
    response_time_ms: float = 0.0


class ScrapedContentBase(BaseModel):
    """Base scraped content model"""
    project_id: str
    source_id: str
    crawl_job_id: str
    url: str
    title: str
    content: str
    content_type: Literal["article", "pdf", "social_post", "data", "other"] = "article"
    keywords_detected: List[str] = Field(default_factory=list)


class ScrapedContentCreate(ScrapedContentBase):
    """Model for creating scraped content"""
    content_html: Optional[str] = None
    metadata: ContentMetadata = Field(default_factory=ContentMetadata)
    features: ContentFeatures = Field(default_factory=ContentFeatures)


class ScrapedContent(ScrapedContentBase):
    """Complete scraped content model"""
    id: PyObjectId = Field(alias="_id")
    content_html: Optional[str] = None
    metadata: ContentMetadata = Field(default_factory=ContentMetadata)
    features: ContentFeatures = Field(default_factory=ContentFeatures)
    crawled_at: datetime = Field(default_factory=datetime.utcnow)
    indexed_at: datetime = Field(default_factory=datetime.utcnow)
    
    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True

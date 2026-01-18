"""
LLM conversation model definitions.
"""
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any, Literal
from datetime import datetime
from bson import ObjectId


from app.models.project import PyObjectId

class SourceCitation(BaseModel):
    """Cited source reference"""
    doc_id: str
    url: str
    title: str
    relevance: float = Field(..., ge=0.0, le=1.0)


class Message(BaseModel):
    """Chat message"""
    role: Literal["user", "assistant", "system"]
    content: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    sources_cited: List[SourceCitation] = Field(default_factory=list)
    tokens_used: Optional[int] = None


class ConversationMetadata(BaseModel):
    """Conversation metadata"""
    model: str = "llama-3.3-70b-versatile"
    total_messages: int = 0
    total_tokens: int = 0


class LLMConversationBase(BaseModel):
    """Base conversation model"""
    project_id: str
    title: str = Field(..., min_length=1, max_length=200)


class LLMConversationCreate(LLMConversationBase):
    """Model for creating a conversation"""
    pass


class LLMConversation(LLMConversationBase):
    """Complete conversation model"""
    id: PyObjectId = Field(alias="_id")
    messages: List[Message] = Field(default_factory=list)
    context_documents_used: List[str] = Field(default_factory=list)
    metadata: ConversationMetadata = Field(default_factory=ConversationMetadata)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True

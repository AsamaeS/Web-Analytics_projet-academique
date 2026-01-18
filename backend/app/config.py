"""
Application configuration using Pydantic Settings.
Loads configuration from environment variables.
"""
from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    """Application settings loaded from environment variables"""
    
    # Application
    app_name: str = "Web Intelligence Platform"
    app_version: str = "1.0.0"
    debug: bool = False
    
    # MongoDB
    mongodb_url: str = "mongodb://admin:changeme123@localhost:27017"
    mongodb_db_name: str = "webintel"
    
    # Redis & RQ
    redis_url: str = "redis://localhost:6379"
    rq_queue_discovery: str = "discovery"
    rq_queue_scrape: str = "scrape"
    
    # Groq LLM
    groq_api_key: str = ""
    groq_model: str = "llama-3.3-70b-versatile"
    
    # Crawler Settings
    crawler_timeout: int = 30
    crawler_max_pages_discovery: int = 20
    crawler_max_pages_full: int = 100
    crawler_max_depth: int = 3
    crawler_delay_min: float = 2.0
    crawler_delay_max: float = 5.0
    crawler_respect_robots: bool = True
    
    # CORS
    cors_origins: List[str] = ["http://localhost:3000", "http://localhost:5173"]
    
    class Config:
        env_file = ".env"
        case_sensitive = False


# Global settings instance
settings = Settings()

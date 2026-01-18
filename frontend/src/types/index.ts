/**
 * TypeScript definitions matching backend models
 */

export interface Project {
    _id: string
    name: string
    description?: string
    type: 'investment' | 'market_research' | 'strategic_watch' | 'competitive_intelligence'
    domain?: string
    keywords: string[]
    settings: ProjectSettings
    stats: ProjectStats
    created_at: string
    updated_at: string
}

export interface ProjectSettings {
    crawl_frequency: 'daily' | 'weekly' | 'manual'
    max_depth: number
    respect_robots_txt: boolean
    language: string
    enable_llm_analysis: boolean
    max_pages_per_source: number
}

export interface ProjectStats {
    total_sources: number
    active_sources: number
    paused_sources: number
    failed_sources: number
    total_documents: number
    last_crawl_date?: string
    avg_relevance_score: number
}

export interface CreateProjectDTO {
    name: string
    description?: string
    type: string
    domain?: string
    keywords: string[]
    settings?: Partial<ProjectSettings>
}

export interface Source {
    _id: string
    project_id: string
    name: string
    type: 'website' | 'rss' | 'api' | 'social_media'
    url: string
    status: 'active' | 'paused' | 'failed' | 'blocked' | 'pending_discovery'
    config: SourceConfig
    metrics: SourceMetrics
    created_at: string
    updated_at: string
}

export interface SourceConfig {
    max_pages: number
    timeout_seconds: number
    verify_ssl: boolean
    javascript_rendering: boolean
}

export interface SourceMetrics {
    relevance_score: number
    keywords_matched: number
    discovery_completed: boolean
}

export interface ScrapedContent {
    _id: string
    project_id: string
    source_id: string
    title: string
    url: string
    content: string
    keywords_detected: string[]
    metadata: any
    features: {
        sentiment?: {
            score: number
            label: 'positive' | 'neutral' | 'negative'
        }
        entities?: Array<{ text: string, type: string, count: number }>
        relevance_score: number
    }
}

export interface CrawlJob {
    _id: string
    project_id: string
    source_id: string
    type: 'discovery' | 'full_scrape'
    status: 'pending' | 'running' | 'completed' | 'failed'
    stats: any
    created_at: string
}

export interface Project {
    id: string;
    name: string;
    type: 'investment' | 'market_research' | 'strategic_watch' | 'competitive_intelligence';
    keywords: string[];
}

export interface ProjectStats {
    total_documents: number;
    total_sources: number;
    avg_sentiment: number;
    last_crawl: string | null;
}

export interface TimelineData {
    date: string;
    count: number;
}

export interface SentimentData {
    label: 'Positive' | 'Neutral' | 'Negative';
    value: number;
    percentage: number;
}

export interface KeywordData {
    keyword: string;
    count: number;
}

export interface SourceData {
    source_name: string;
    doc_count: number;
    avg_relevance: number;
}

export interface Insights {
    insights: string[];
    summary: string;
}

export interface DashboardData {
    project: Project;
    stats: ProjectStats;
    timeline: TimelineData[];
    sentiment: SentimentData[];
    keywords: KeywordData[];
    sources: SourceData[];
    insights: Insights;
}

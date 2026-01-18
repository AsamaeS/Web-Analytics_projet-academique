"""
Discovery Crawler Service.
Lightweight crawler to analyze source relevance before full scraping.
"""
import asyncio
import httpx
from bs4 import BeautifulSoup
from typing import Dict, List, Set
from app.utils.rate_limiter import RateLimiter
from app.services.robust_crawler import RobustCrawler

class DiscoveryCrawler:
    """
    Crawls 10-20 pages to calculate relevance metrics.
    Uses RobustCrawler for anti-blocking fetching.
    """
    
    def __init__(self, source: dict, project_keywords: List[str], max_pages: int = 15):
        self.source = source
        self.keywords = [k.lower() for k in project_keywords]
        self.max_pages = max_pages
        # Initialize robust crawler with source config
        self.crawler = RobustCrawler(
            source=source,
            config=source.get("config", {})
        )
        
        self.results = {
            "pages_analyzed": 0,
            "total_words": 0,
            "keywords_found": {kw: 0 for kw in self.keywords},
            "response_times": [],
            "errors": 0
        }
    
    async def run(self) -> Dict[str, float]:
        """Run discovery crawl and return metrics"""
        
        visited: Set[str] = set()
        to_visit: List[str] = [self.source["url"]]
        
        # Limit total time for discovery to avoid stalling
        end_time = asyncio.get_event_loop().time() + 300  # 5 minutes max
        
        while to_visit and len(visited) < self.max_pages:
            if asyncio.get_event_loop().time() > end_time:
                break
                
            url = to_visit.pop(0)
            if url in visited:
                continue
            
            # Parse
            try:
                # Fetch using RobustCrawler (handles rate limits, retries, headers, playwright)
                start = asyncio.get_event_loop().time()
                html = await self.crawler.fetch(url)
                elapsed = asyncio.get_event_loop().time() - start
                
                self.results["response_times"].append(elapsed * 1000)
                
                if not html:
                    print(f"Failed to fetch {url}")
                    self.results["errors"] += 1
                    continue
                
                visited.add(url)
                self.results["pages_analyzed"] += 1

                soup = BeautifulSoup(html, 'lxml')
                # Remove scripts and styles
                for script in soup(["script", "style"]):
                    script.decompose()
                    
                text = soup.get_text(separator=' ', strip=True)
                
                # Detect keywords
                text_lower = text.lower()
                for kw in self.keywords:
                    # Exact match
                    count = text_lower.count(kw)
                    if count > 0:
                        self.results["keywords_found"][kw] += count
                    else:
                        # Fuzzy match for multi-word
                        kw_words = [w for w in kw.split() if len(w) > 2]
                        if len(kw_words) > 1:
                            if sum(1 for w in kw_words if w in text_lower) >= len(kw_words) - 1:
                                self.results["keywords_found"][kw] += 0.5
                
                self.results["total_words"] += len(text.split())
                
                # Extract internal links
                self._extract_links(soup, url, visited, to_visit)
                
            except Exception as e:
                print(f"Error parsing {url}: {e}")
                self.results["errors"] += 1
        
        return self._calculate_metrics()
    
    def _extract_links(self, soup: BeautifulSoup, current_url: str, visited: Set[str], to_visit: List[str]):
        """Extract internal links and add to queue"""
        # Determine base URL for relative links
        base_url = self.source["url"].rstrip('/')
        
        for link in soup.find_all('a', href=True):
            href = link['href']
            
            # Handle relative URLs
            if href.startswith('/'):
                href = f"{base_url}{href}"
            elif not href.startswith('http'):
                continue # Skip javascript:, mailto:, etc.

            # Simple internal check: strictly starts with base_url
            if href.startswith(base_url) and href not in visited and href not in to_visit:
                # Prioritize links that look irrelevant less (optional optimization)
                to_visit.append(href)

    
    def _calculate_metrics(self) -> Dict[str, float]:
        """Calculate source relevance metrics"""
        
        # 1. Keyword density (40%)
        # Calculate weighted density: (total_matches / total_words) * 100
        # Expected good density is around 0.5% - 1.0%
        total_keyword_occurrences = sum(self.results["keywords_found"].values())
        total_words = max(self.results["total_words"], 1)
        keyword_density = total_keyword_occurrences / total_words
        
        # Scaling: 0.005 (0.5%) = 1.0 score
        keyword_score = min(keyword_density / 0.005, 1.0) * 0.4
        
        # 2. Content quality (30%)
        # Assume 500 words avg is decent quality
        avg_words = total_words / max(self.results["pages_analyzed"], 1)
        quality_score = min(avg_words / 500, 1.0) * 0.3
        
        # 3. Accessibility (20%)
        if self.results["response_times"]:
            avg_time = sum(self.results["response_times"]) / len(self.results["response_times"])
        else:
            avg_time = 5000
            
        # Decay: 0ms=1.0, 2000ms=0.5, 5000ms=0.0
        access_score = max(0, (5000 - avg_time) / 5000) * 0.2
        
        # 4. Reliability (10%)
        pages = max(self.results["pages_analyzed"], 1)
        success_rate = (pages - self.results["errors"]) / pages
        reliability_score = success_rate * 0.1
        
        relevance_score = keyword_score + quality_score + access_score + reliability_score
        
        # Boost relevance if specific highly important keywords are found
        # (could be added later)
        
        return {
            "relevance_score": round(relevance_score, 3),
            "keywords_matched": len([k for k, v in self.results["keywords_found"].items() if v > 0]),
            "top_keywords_found": {k: v for k, v in self.results["keywords_found"].items() if v > 0},
            "keyword_density": round(keyword_density, 5),
            "content_quality_score": round(quality_score / 0.3, 3), 
            "accessibility_score": round(access_score / 0.2, 3),
            "avg_response_time_ms": round(avg_time, 0)
        }

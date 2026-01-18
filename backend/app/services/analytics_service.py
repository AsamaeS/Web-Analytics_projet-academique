"""
Analytics Service for dashboard aggregation.
"""
from app.database import get_database
from typing import Dict, Any, List

class AnalyticsService:
    """
    Aggregates data for the dashboard.
    """
    
    async def get_overview(self, project_id: str) -> Dict[str, Any]:
        """Get high-level metrics"""
        db = await get_database()
        
        from bson import ObjectId
        
        # Sources stored as string project_id, Content as ObjectId project_id (legacy mismatch)
        # We handle both here.
        
        stats = {
            "total_documents": await db.scraped_content.count_documents({"project_id": ObjectId(project_id)}),
            "total_sources": await db.sources.count_documents({"project_id": project_id}),
            "avg_sentiment": 0.0
        }
        
        # Calculate avg sentiment using pipeline
        pipeline = [
            {"$match": {"project_id": ObjectId(project_id)}},
            {"$group": {"_id": None, "avg_sent": {"$avg": "$features.sentiment.score"}}}
        ]
        res = await db.scraped_content.aggregate(pipeline).to_list(1)
        if res:
            stats["avg_sentiment"] = round(res[0]["avg_sent"], 2)
            
        return stats

    async def get_source_relevance(self, project_id: str) -> List[Dict[str, Any]]:
        """Get sources ranked by relevance"""
        db = await get_database()
        
        # Get all sources
        sources = await db.sources.find(
            {"project_id": project_id},
            {"name": 1, "url": 1, "status": 1, "metrics": 1, "config": 1}
        ).sort("metrics.relevance_score", -1).to_list(100)
        
        results = []
        for i, source in enumerate(sources, 1):
            metrics = source.get("metrics", {})
            results.append({
                "rank": i,
                "id": str(source["_id"]),
                "name": source["name"],
                "url": source["url"],
                "status": source.get("status", "pending_discovery"),
                "relevance_score": metrics.get("relevance_score", 0),
                "keywords_matched": metrics.get("top_keywords_found", {}),
                "keywords_count": metrics.get("keywords_matched", 0),
                "content_quality": metrics.get("content_quality_score", 0),
            })
            
        return results

    async def get_timeline(self, project_id: str) -> Dict[str, Any]:
        """Docs over time"""
        db = await get_database()
        from bson import ObjectId
        pipeline = [
            {"$match": {"project_id": ObjectId(project_id)}},
            {
                "$group": {
                    "_id": {
                        "$dateToString": {"format": "%Y-%m-%d", "date": "$crawled_at"}
                    },
                    "count": {"$sum": 1}
                }
            },
            {"$sort": {"_id": 1}}
        ]
        data = await db.scraped_content.aggregate(pipeline).to_list(30)
        return [{"date": d["_id"], "count": d["count"]} for d in data]

    async def get_sentiment_distribution(self, project_id: str) -> List[Dict[str, Any]]:
        """Count docs by sentiment label"""
        db = await get_database()
        from bson import ObjectId
        pipeline = [
            {"$match": {"project_id": ObjectId(project_id)}},
            {"$group": {"_id": "$features.sentiment.label", "count": {"$sum": 1}}}
        ]
        res = await db.scraped_content.aggregate(pipeline).to_list(10)
        # Ensure labels are nice
        label_map = {"positive": "Positive", "neutral": "Neutral", "negative": "Negative"}
        return [{"label": label_map.get(d["_id"], d["_id"]), "count": d["count"]} for d in res if d["_id"]]

    async def get_keyword_stats(self, project_id: str) -> List[Dict[str, Any]]:
        """Aggregate detected keywords"""
        db = await get_database()
        from bson import ObjectId
        pipeline = [
            {"$match": {"project_id": ObjectId(project_id)}},
            {"$unwind": "$keywords_detected"},
            {"$group": {"_id": "$keywords_detected", "count": {"$sum": 1}}},
            {"$sort": {"count": -1}},
            {"$limit": 20}
        ]
        res = await db.scraped_content.aggregate(pipeline).to_list(20)
        return [{"keyword": d["_id"], "count": d["count"]} for d in res]

    async def get_entity_stats(self, project_id: str) -> Dict[str, List[Dict[str, Any]]]:
        """Aggregate named entities (ORGs, PERSONS, etc.)"""
        db = await get_database()
        from bson import ObjectId
        pipeline = [
            {"$match": {"project_id": ObjectId(project_id)}},
            {"$unwind": "$features.entities"},
            {"$group": {
                "_id": {
                    "text": "$features.entities.text",
                    "label": "$features.entities.label"
                },
                "count": {"$sum": 1}
            }},
            {"$sort": {"count": -1}},
            {"$limit": 30}
        ]
        res = await db.scraped_content.aggregate(pipeline).to_list(30)
        
        entities = {"ORG": [], "PERSON": [], "GPE": [], "OTHER": []}
        for d in res:
            label = d["_id"]["label"]
            item = {"text": d["_id"]["text"], "count": d["count"]}
            if label in entities:
                entities[label].append(item)
            else:
                entities["OTHER"].append(item)
                
        return entities

"""
LLM Service integration with Groq.
"""
import os
from groq import AsyncGroq
from typing import List, Dict, AsyncIterator, Any
from app.database import get_database
from app.config import settings

class LLMService:
    """
    Service for RAG-based chat using Groq.
    """
    
    def __init__(self):
        self.api_key = settings.groq_api_key or os.getenv("GROQ_API_KEY")
        self.client = AsyncGroq(api_key=self.api_key) if self.api_key else None
        self.model = settings.groq_model
        self.db = None
        
    async def chat_stream(self, project: dict, user_message: str, conversation_history: List[Dict]) -> AsyncIterator[str]:
        """
        Stream chat response with RAG context.
        """
        if not self.client:
            yield "Error: Groq API key not configured."
            return

        # 1. Search Context
        if self.db is None:
            self.db = await get_database()
            
        relevant_docs = await self._search_documents(str(project["_id"]), user_message)
        context_str = self._build_context(relevant_docs)
        
        # 2. System Prompt
        system_prompt = self._get_system_prompt(project, context_str)
        
        # 3. Messages
        messages = [{"role": "system", "content": system_prompt}]
        # Add last 6 messages
        for msg in conversation_history[-6:]:
            messages.append({"role": msg["role"], "content": msg["content"]})
            
        messages.append({"role": "user", "content": user_message})
        
        # 4. Stream
        try:
            stream = await self.client.chat.completions.create(
                model=self.model,
                messages=messages,
                temperature=0.3,
                max_tokens=2048,
                stream=True
            )
            
            async for chunk in stream:
                if chunk.choices[0].delta.content:
                    yield chunk.choices[0].delta.content
                    
        except Exception as e:
            yield f"Error calling LLM: {str(e)}"

    async def _search_documents(self, project_id: str, query: str, limit: int = 15) -> List[Dict]:
        """
        MongoDB Text Search with intelligent re-ranking.
        Fetches top 50 text matches, then re-ranks by (textScore * relevance_score).
        """
        from bson import ObjectId
        
        # Fetch more candidates to re-rank
        # Fetch more candidates to re-rank
        try:
            cursor = self.db.scraped_content.find(
                {
                    "project_id": ObjectId(project_id),
                    "$text": {"$search": query}
                },
                {
                    "score": {"$meta": "textScore"},
                    "title": 1, "url": 1, "content": 1, "metadata": 1, "features": 1
                }
            ).sort([("score", {"$meta": "textScore"})]).limit(50)
            
            candidates = await cursor.to_list(50)
        except Exception as e:
            print(f"Text search failed: {e}")
            # Fallback: simple regex search or return empty
            return []
        
        # Re-rank logic: Text Match Score * (0.5 + 0.5 * Semantic Relevance Score)
        # This gives weight to both the keyword match and the document's overall quality/relevance
        for doc in candidates:
            rel_score = doc.get("features", {}).get("relevance_score", 0.5)
            doc["final_score"] = doc.get("score", 0) * (0.5 + 0.5 * rel_score)
            
        # Sort by new final score
        candidates.sort(key=lambda x: x["final_score"], reverse=True)
        
        return candidates[:limit]

    def _build_context(self, docs: List[Dict]) -> str:
        if not docs:
            return "No documents found."
            
        context = []
        for i, doc in enumerate(docs, 1):
            content = doc.get('content', '')
            # Quality filter: skip very short snippets
            if len(content) < 100:
                continue
                
            snippet = content[:800].replace('\n', ' ')
            title = doc.get('title', 'Unknown Title')
            url = doc.get('url', '#')
            rel = round(doc.get("features", {}).get("relevance_score", 0), 2)
            
            context.append(f"[{i}] {title} (Rel: {rel})\nSource: {url}\nContent: {snippet}...\n")
            
        return "\n".join(context)

    def _get_system_prompt(self, project: dict, context: str) -> str:
        return f"""
        You are an expert analyst helping with project "{project.get('name')}" ({project.get('type')}).
        Context Documents:
        {context}
        
        Instructions:
        - Answer based ONLY on the context provided.
        - Cite sources using [Title](URL) format.
        - Be professional and concise.
        """

    async def generate_insights(self, project_name: str, project_type: str, keywords: List[str], doc_count: int) -> Dict[str, Any]:
        """
        Generate high-level project insights using Groq.
        """
        if not self.client:
            return {"insights": ["⚠️ Groq API key not configured"], "summary": "Configure API key in backend .env"}

        prompt = f"""
        You are an expert analyst for the project "{project_name}" (type: {project_type}).
        Generate 5 key insights for a project with {doc_count} documents analyzed.
        Target keywords: {", ".join(keywords)}

        Format: list of 5 short bullets (max 20 words each) with relevant emojis.
        Example: "📈 15% growth detected in sector x"
        
        Respond ONLY with the 5 bullets.
        """

        try:
            response = await self.client.chat.completions.create(
                model=self.model,
                messages=[{"role": "user", "content": prompt}],
                temperature=0.3,
                max_tokens=300
            )
            content = response.choices[0].message.content or ""
            
            # Parse bullets
            insights = [line.strip().lstrip("-* ").strip() for line in content.split("\\n") if line.strip()]
            insights = insights[:5] # Limit to 5

            # Generate summary
            summary_prompt = f"In 2 sentences max, summarize the status of project {project_name} based on {doc_count} documents analyzed."
            summary_res = await self.client.chat.completions.create(
                model=self.model,
                messages=[{"role": "user", "content": summary_prompt}],
                max_tokens=150
            )
            summary = summary_res.choices[0].message.content or ""

            return {"insights": insights, "summary": summary}
            
        except Exception as e:
            print(f"Insight generation error: {e}")
            return {"insights": ["❌ Error generating insights"], "summary": "Error calling LLM"}

    async def generate_chart_commentary(self, chart_type: str, data: Any, project_context: Dict) -> str:
        """
        Generate analysis for a specific chart.
        """
        if not self.client:
            return "⚠️ Groq API key not configured."

        prompts = {
            "timeline": f"Analyze this timeline graph data: {data}. Identify trends, peaks, or drops for project '{project_context.get('name')}'. Answer in 2 short actionable sentences.",
            "sentiment": f"Analyze this sentiment distribution: {data}. What is the dominant sentiment for '{project_context.get('name')}'? Answer in 2 short sentences.",
            "keywords": f"Analyze these top keywords: {data}. Identify dominant themes for '{project_context.get('name')}'. Answer in 2 short sentences.",
            "sources": f"Analyze these top sources: {data}. Evaluate source quality/relevance for '{project_context.get('name')}'. Answer in 2 short sentences."
        }
        
        prompt = prompts.get(chart_type, f"Analyze this data: {data}. Answer in 2 short sentences.")

        try:
            response = await self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": "You are a data analyst. Be concise and actionable."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.4,
                max_tokens=150
            )
            return response.choices[0].message.content or "No commentary available."
        except Exception as e:
            return "❌ Error generating commentary"

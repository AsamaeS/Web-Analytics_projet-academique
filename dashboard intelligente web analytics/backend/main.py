from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Optional
import uvicorn
from datetime import datetime

app = FastAPI()

# Enable CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mock Data (Mirroring Typescript mock data)
MOCK_DATA = {
    "1": {
        "project": {
            "id": "1",
            "name": "Investissement Secteur Hospitalier",
            "type": "investment",
            "keywords": ["hôpital", "budget", "santé", "investissement"]
        },
        "stats": {
            "total_documents": 1847,
            "total_sources": 12,
            "avg_sentiment": 0.65,
            "last_crawl": "2025-01-17T10:30:00Z"
        },
        "timeline": [
            { "date": '2025-01-10', "count": 45 },
            { "date": '2025-01-11', "count": 67 },
            { "date": '2025-01-12', "count": 89 },
            { "date": '2025-01-13', "count": 56 },
            { "date": '2025-01-14', "count": 123 },
            { "date": '2025-01-15', "count": 98 },
            { "date": '2025-01-16', "count": 145 },
            { "date": '2025-01-17', "count": 167 },
        ],
        "sentiment": [
            { "label": 'Positive', "value": 450, "percentage": 45 },
            { "label": 'Neutral', "value": 350, "percentage": 35 },
            { "label": 'Negative', "value": 200, "percentage": 20 }
        ],
        "keywords": [
            { "keyword": 'hôpital', "count": 245 },
            { "keyword": 'budget', "count": 189 },
            { "keyword": 'santé', "count": 167 },
            { "keyword": 'investissement', "count": 145 },
            { "keyword": 'financement', "count": 123 },
            { "keyword": 'infrastructure', "count": 98 },
            { "keyword": 'équipement', "count": 87 },
            { "keyword": 'personnel', "count": 76 },
            { "keyword": 'capacité', "count": 65 },
            { "keyword": 'restructuration', "count": 54 },
        ],
        "sources": [
            { "source_name": 'WHO Website', "doc_count": 156, "avg_relevance": 0.87 },
            { "source_name": 'Ministère Santé', "doc_count": 134, "avg_relevance": 0.82 },
            { "source_name": 'Le Figaro Santé', "doc_count": 98, "avg_relevance": 0.78 },
            { "source_name": 'Reuters Health', "doc_count": 87, "avg_relevance": 0.75 },
            { "source_name": 'France Info', "doc_count": 76, "avg_relevance": 0.71 },
        ]
    },
    "2": {
        "project": {
            "id": "2",
            "name": "Étude Marché Énergies Renouvelables",
            "type": "market_research",
            "keywords": ["éolien", "solaire", "énergie", "transition"]
        },
        "stats": {
            "total_documents": 2341,
            "total_sources": 18,
            "avg_sentiment": 0.72,
            "last_crawl": "2025-01-17T14:20:00Z"
        },
        "timeline": [
            { "date": '2025-01-10', "count": 78 },
            { "date": '2025-01-11', "count": 92 },
            { "date": '2025-01-12', "count": 134 },
            { "date": '2025-01-13', "count": 98 },
            { "date": '2025-01-14', "count": 156 },
            { "date": '2025-01-15', "count": 187 },
            { "date": '2025-01-16', "count": 201 },
            { "date": '2025-01-17', "count": 234 },
        ],
        "sentiment": [
            { "label": 'Positive', "value": 720, "percentage": 58 },
            { "label": 'Neutral', "value": 390, "percentage": 31 },
            { "label": 'Negative', "value": 140, "percentage": 11 }
        ],
        "keywords": [
            { "keyword": 'solaire', "count": 456 },
            { "keyword": 'éolien', "count": 389 },
            { "keyword": 'transition', "count": 312 },
            { "keyword": 'renouvelable', "count": 298 },
            { "keyword": 'photovoltaïque', "count": 234 },
            { "keyword": 'hydrogène', "count": 198 },
            { "keyword": 'stockage', "count": 176 },
            { "keyword": 'batterie', "count": 145 },
        ],
        "sources": [
            { "source_name": 'IEA Reports', "doc_count": 234, "avg_relevance": 0.91 },
            { "source_name": 'RTE France', "doc_count": 198, "avg_relevance": 0.88 },
            { "source_name": 'ADEME', "doc_count": 176, "avg_relevance": 0.85 },
            { "source_name": 'Les Echos Energie', "doc_count": 145, "avg_relevance": 0.79 },
        ]
    }
}

@app.get("/api/projects")
async def get_projects():
    projects = [data["project"] for data in MOCK_DATA.values()]
    return {"projects": projects}

@app.get("/api/dashboard/projects/{project_id}/overview")
async def get_overview(project_id: str):
    if project_id not in MOCK_DATA:
        raise HTTPException(status_code=404, detail="Project not found")
    data = MOCK_DATA[project_id]
    return {"project": data["project"], "stats": data["stats"]}

@app.get("/api/dashboard/projects/{project_id}/timeline")
async def get_timeline(project_id: str):
    if project_id not in MOCK_DATA:
        raise HTTPException(status_code=404, detail="Project not found")
    return {"data": MOCK_DATA[project_id]["timeline"]}

@app.get("/api/dashboard/projects/{project_id}/sentiment")
async def get_sentiment(project_id: str):
    if project_id not in MOCK_DATA:
        raise HTTPException(status_code=404, detail="Project not found")
    return {"data": MOCK_DATA[project_id]["sentiment"]}

@app.get("/api/dashboard/projects/{project_id}/keywords")
async def get_keywords(project_id: str):
    if project_id not in MOCK_DATA:
        raise HTTPException(status_code=404, detail="Project not found")
    return {"data": MOCK_DATA[project_id]["keywords"]}

@app.get("/api/dashboard/projects/{project_id}/top-sources")
async def get_sources(project_id: str):
    if project_id not in MOCK_DATA:
        raise HTTPException(status_code=404, detail="Project not found")
    return {"data": MOCK_DATA[project_id]["sources"]}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)

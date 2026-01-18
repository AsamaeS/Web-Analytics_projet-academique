# API Documentation

The backend is built with FastAPI and provides a self-documenting interface at `/docs` (Swagger UI) and `/redoc`.

## Core Endpoints

### Projects
- `POST /api/projects/`: Create a new project.
- `GET /api/projects/`: List all projects.
- `GET /api/projects/{id}`: Get project details.
- `PUT /api/projects/{id}`: Update project settings.
- `DELETE /api/projects/{id}`: Delete project and its data.

### Sources
- `POST /api/projects/{id}/sources`: Add a source.
- `GET /api/projects/{id}/sources`: List sources.
- `DELETE /api/sources/{id}`: Remove a source.

### Crawling
- `POST /api/projects/{id}/crawl/discovery`: Trigger discovery on pending sources.
- `POST /api/projects/{id}/crawl/full`: Trigger full scrape on selected sources.
- `GET /api/projects/{id}/crawl/status`: Check active job status.

### Content
- `GET /api/projects/{id}/content`: List/search scraped documents.
- `GET /api/content/{id}`: Get raw content and metadata.

### Analytics
- `GET /api/projects/{id}/analytics/overview`: Get aggregated stats.
- `GET /api/projects/{id}/analytics/timeline`: Get activity timeseries.

### LLM
- `POST /api/projects/{id}/chat/`: Stream chat response using RAG.

## Data Models

Refer to `backend/app/models/` for full Pydantic schemas.

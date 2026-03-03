# Web Intelligence Platform

A complete, production-ready web intelligence and market watch platform. This system allows users to monitor websites, extract content using powerful crawling technology, analyze data with NLP (Sentiment, NER), and interact with the data using an integrated LLM chatbot.

## Features

- **Project Management**: Organize monitoring targets into isolated projects (Investment, Market Research, etc.).
- **Robust Crawling**: 
  - Discovery crawling to find relevant sources.
  - Full scraping with anti-blocking mechanisms (Playwright fallback, User-Agent rotation).
  - Adaptive rate limiting and retry logic.
- **Advanced NLP**:
  - Content relevance scoring using TF-IDF/Cosine Similarity.
  - Sentiment Analysis (Positive, Neutral, Negative).
  - Named Entity Recognition (companies, people, locations).
- **Interactive Dashboard**:
  - Real-time crawling status.
  - Activity timelines and aggregate metrics.
- **AI Chatbot**:
  - Integrated RAG (Retrieval-Augmented Generation) chat.
  - Ask questions about your scraped data.
  - Citations and source tracking.
- **Containerized**: Fully Dockerized for easy deployment (Backend, Frontend, MongoDB, Redis, Worker).

## Tech Stack

- **Backend**: Python 3.11, FastAPI, MongoDB (Motor), Redis, RQ (Workers).
- **Frontend**: React 18, TypeScript, TailwindCSS, shadcn/ui, Recharts.
- **Infrastructure**: Docker Compose, Nginx.
- **AI/ML**: Google Gemini 1.5 Pro , spaCy, scikit-learn, VADER.

## Quick Start

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd web-intelligence-platform
   ```

2. **Configure Environment**
   Copy the example environment file:
   ```bash
   cp .env.example .env
   ```
   Edit `.env` and add your `Google Gemini 1.5 Pro_API_KEY`.

3. **Run with Docker**
   ```bash
   docker-compose up --build -d
   ```

4. **Access the Application**
   - **Frontend**: http://localhost
   - **Backend API**: http://localhost:8000/docs
   - **MongoDB Express** (if enabled): http://localhost:8081

## Project Structure

```
├── backend/            # FastAPI Backend
│   ├── app/
│   │   ├── services/   # Crawler, NLP, LLM services
│   │   ├── routers/    # API endpoints
│   │   ├── models/     # Pydantic/MongoDB models
│   │   └── workers/    # RQ task definitions
├── frontend/           # React Frontend
│   ├── src/
│   │   ├── components/ # UI and Feature components
│   │   ├── pages/      # Route pages
│   │   └── hooks/      # React Query hooks
├── docs/               # Documentation
└── docker-compose.yml  # Orchestration
```

## Usage Guide

1. **Create a Project**: Define your topic (e.g., "Renewable Energy") and keywords.
2. **Add Sources**: Input URLs to monitor. You can run a "Discovery" crawl to check relevance first.
3. **Start Scraping**: Trigger a full scrape on active sources. The worker will handle the crawling in the background.
4. **View Dashboard**: Monitor the progress and see the number of documents collected.
5. **Chat with Data**: Go to the "AI Assistant" tab to query your knowledge base.

## License

MIT

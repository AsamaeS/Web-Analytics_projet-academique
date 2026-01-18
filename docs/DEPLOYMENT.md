# Deployment Guide

This guide covers deploying the Web Intelligence Platform using Docker.

## Prerequisites
- Docker Engine & Docker Compose
- A Groq API Key (for LLM features)

## Environment Variables
Ensure `.env` is populated:
```ini
MONGODB_URL=mongodb://mongodb:27017
REDIS_URL=redis://redis:6379
GROQ_API_KEY=gsk_...
VITE_API_URL=http://localhost:8000 # Used during frontend build
```

## Deployment Steps

1. **Build and Start Containers**
   ```bash
   docker-compose up --build -d
   ```
   This will build the backend (Python) and frontend (Node build -> Nginx) images.

2. **Verify Services**
   Check if containers are healthy:
   ```bash
   docker-compose ps
   ```

3. **Worker Scaling**
   The worker service handles crawling. You can scale it for higher throughput:
   ```bash
   docker-compose up -d --scale worker=3
   ```
   *Note: Ensure your MongoDB/Redis and machine resources can handle the load.*

## Production Considerations

- **Nginx**: The provided `nginx.conf` is basic. For production, add SSL/TLS (Certbot), security headers, and increase timeouts for long requests.
- **Persistence**: MongoDB data is persisted in the `mongo_data` volume. Ensure you back up this volume regularly.
- **Security**: 
  - Change default ports if exposing to the internet.
  - Implement authentication (currently not included in MVP).
  - Use a firewall to restrict access to MongoDB/Redis ports.

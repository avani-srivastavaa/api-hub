# 🐳 Docker Guide - API Hub

Complete guide for running the entire application stack using Docker and Docker Compose.

---

## 📋 Prerequisites

- Docker Desktop 4.0+ (or Docker Engine + Docker Compose)
- 4GB available disk space minimum
- 2GB available RAM minimum
- Internet connection for pulling images

---

## 🚀 Quick Start with Docker

### Option 1: Using Docker Compose (Recommended)

Easiest way to run everything together locally.

1. Open PowerShell in the project folder.
2. If `.env` does not already exist, create your private local copy:

   ```powershell
   Copy-Item .env.example .env
   notepad .env
   ```

3. Replace the provider placeholders with API keys from the providers you want
   to use. At least one provider key is needed for AI requests. Do not commit or
   share `.env`; it is excluded by `.gitignore`.
4. Start the services:

   ```powershell
   docker compose up --build -d
   ```

5. Open the frontend at http://localhost:3000. The dashboard reports whether a
   provider key is configured; it does not reveal the key or verify it with a
   provider. A real connector request is needed to confirm the key is valid and
   may incur provider usage charges.
6. To stop the services, run `docker compose down`. To also delete the database
   volume and its data, run `docker compose down -v`.

If you edit `.env` while the services are running, recreate the backend so it
receives the updated values:

```powershell
docker compose up --force-recreate -d backend
```
```

---

### Option 2: Build & Run Individually

For more control, build and run containers separately.

```bash
# Build images
docker build -t api-hub-backend -f backend/Dockerfile .
docker build -t api-hub-frontend -f frontend/Dockerfile .

# Start PostgreSQL
docker run -d \
  --name api-hub-postgres \
  -e POSTGRES_USER=api_hub_user \
  -e POSTGRES_PASSWORD=secure_password \
  -e POSTGRES_DB=api_hub_db \
  -p 5432:5432 \
  -v postgres_data:/var/lib/postgresql/data \
  postgres:15-alpine

# Wait for PostgreSQL to be ready
sleep 10

# Start backend
docker run -d \
  --name api-hub-backend \
  -e DATABASE_URL=postgresql://api_hub_user:secure_password@host.docker.internal:5432/api_hub_db \
  -e ANTHROPIC_API_KEY=sk-ant-... \
  -e OPENAI_API_KEY=sk-... \
  -e GEMINI_API_KEY=... \
  -p 5000:5000 \
  api-hub-backend

# Start frontend
docker run -d \
  --name api-hub-frontend \
  -e VITE_API_URL=http://localhost:5000 \
  -p 3000:3000 \
  api-hub-frontend

# View logs
docker logs api-hub-backend
docker logs api-hub-frontend

# Stop containers
docker stop api-hub-backend api-hub-frontend api-hub-postgres
docker rm api-hub-backend api-hub-frontend api-hub-postgres
```

---

## 📦 What Docker Provides

### Backend Service
- Node.js 18 Alpine image (~150MB)
- Express API server
- Automatic health checks
- Non-root user for security
- Exposed on port 5000

### Frontend Service
- Multi-stage build for optimization
- Node.js build stage + Serve runtime
- Optimized production build (~50MB)
- Exposed on port 3000

### Database Service
- PostgreSQL 15 Alpine image (~200MB)
- Automatic health checks
- Volume persistence (`postgres_data`)
- Exposed on port 5432

### Network
- Isolated Docker network (`api-hub-network`)
- Services communicate by name (postgres, backend, frontend)
- All containers in same network

---

## 🔧 Docker Compose Configuration

### Understanding docker-compose.yml

```yaml
version: '3.8'  # Docker Compose version

services:
  postgres:
    # PostgreSQL database
    image: postgres:15-alpine
    environment:
      POSTGRES_USER: ${DB_USER}  # From .env file
      POSTGRES_PASSWORD: ${DB_PASSWORD}
      POSTGRES_DB: ${DB_NAME}
    ports:
      - "5432:5432"  # Host:Container port mapping
    volumes:
      - postgres_data:/var/lib/postgresql/data  # Persistent storage
    healthcheck:  # Automatic health monitoring
      test: ["CMD-SHELL", "pg_isready -U ${DB_USER}"]
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - api-hub-network  # Connect to network

  backend:
    # API server
    build:
      context: .
      dockerfile: backend/Dockerfile
    environment:
      DATABASE_URL: postgresql://...@postgres:5432/...  # Using 'postgres' hostname
    depends_on:
      postgres:
        condition: service_healthy  # Wait for DB
    volumes:
      - ./backend/src:/app/src  # Hot reload development code
    networks:
      - api-hub-network

  frontend:
    # React app
    build:
      context: .
      dockerfile: frontend/Dockerfile
    depends_on:
      - backend
    networks:
      - api-hub-network

networks:
  api-hub-network:  # Create custom bridge network
    driver: bridge

volumes:
  postgres_data:  # Named volume for persistence
    driver: local
```

---

## 📝 Environment Variables

### Create .env file

```bash
# Database
DB_USER=api_hub_user
DB_PASSWORD=secure_password_here  # Change this!
DB_NAME=api_hub_db

# AI Provider Keys
ANTHROPIC_API_KEY=sk-ant-your-key-here
OPENAI_API_KEY=sk-your-key-here
GEMINI_API_KEY=your-key-here

# Security (generate with: openssl rand -base64 32)
JWT_SECRET=generated-random-secret-here
ENCRYPTION_KEY=generated-random-secret-here
```

### Docker Compose Load Variables

Docker Compose automatically reads `.env`:

```bash
# .env file
DB_USER=api_hub_user

# In docker-compose.yml
environment:
  POSTGRES_USER: ${DB_USER}  # Becomes 'api_hub_user'
```

---

## 🎯 Common Docker Compose Commands

### Basic Operations

```bash
# Start all services
docker-compose up

# Start in background
docker-compose up -d

# Start specific service
docker-compose up postgres
docker-compose up backend

# View logs
docker-compose logs

# Follow logs (live)
docker-compose logs -f

# View specific service logs
docker-compose logs backend
docker-compose logs -f frontend

# Stop services
docker-compose stop

# Stop and remove containers
docker-compose down

# Remove containers + volumes (CLEARS DATABASE)
docker-compose down -v

# Rebuild images
docker-compose build

# Rebuild without cache
docker-compose build --no-cache

# Restart services
docker-compose restart

# Restart specific service
docker-compose restart backend
```

### Debugging

```bash
# List running containers
docker-compose ps

# Execute command in container
docker-compose exec backend sh

# View service status
docker-compose ps

# Check health
docker-compose ps -a

# Scale service (run multiple instances)
docker-compose up -d --scale backend=3

# View network
docker network ls
docker network inspect api-hub-network

# Check volume
docker volume ls
docker volume inspect api-hub_postgres_data
```

---

## 🔍 Managing Containers

### View Container Information

```bash
# List running containers
docker ps

# List all containers
docker ps -a

# View container logs
docker logs api-hub-backend

# Follow logs
docker logs -f api-hub-backend

# View container stats
docker stats api-hub-backend

# Inspect container
docker inspect api-hub-backend

# View container processes
docker top api-hub-backend
```

### Manage Containers

```bash
# Stop container
docker stop api-hub-backend

# Start container
docker start api-hub-backend

# Restart container
docker restart api-hub-backend

# Remove container (must be stopped first)
docker rm api-hub-backend

# Copy file from container
docker cp api-hub-backend:/app/package.json .

# Execute command in container
docker exec api-hub-backend npm list express

# Interactive shell
docker exec -it api-hub-backend sh
docker exec -it api-hub-postgres psql -U api_hub_user -d api_hub_db
```

---

## 📊 Database Management

### Access PostgreSQL in Docker

```bash
# Via Docker Compose
docker-compose exec postgres psql -U api_hub_user -d api_hub_db

# Via Docker
docker exec -it api-hub-postgres psql -U api_hub_user -d api_hub_db

# Via psql client (if installed locally)
psql postgresql://api_hub_user:password@localhost:5432/api_hub_db

# Common commands once connected
\l                    # List databases
\du                   # List users
\d connectors         # Show table structure
SELECT * FROM connectors LIMIT 5;
\q                    # Exit
```

### Backup & Restore

```bash
# Backup database
docker-compose exec postgres pg_dump -U api_hub_user api_hub_db > backup.sql

# Backup all volumes
docker run --rm -v api-hub_postgres_data:/data -v $(pwd):/backup \
  alpine tar czf /backup/postgres_backup.tar.gz /data

# Restore from backup
docker-compose exec -T postgres psql -U api_hub_user api_hub_db < backup.sql

# Restore volume backup
docker volume rm api-hub_postgres_data
docker volume create api-hub_postgres_data
docker run --rm -v api-hub_postgres_data:/data -v $(pwd):/backup \
  alpine tar xzf /backup/postgres_backup.tar.gz -C /
```

---

## 🔐 Security Best Practices

### Secrets Management

```bash
# ❌ DON'T: Put secrets in docker-compose.yml
version: '3.8'
services:
  postgres:
    environment:
      POSTGRES_PASSWORD: secret123  # Bad!

# ✅ DO: Use .env file (excluded from git)
# In .env
POSTGRES_PASSWORD=secret123

# In docker-compose.yml
environment:
  POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}

# Add to .gitignore
echo ".env" >> .gitignore
```

### Use Non-root User

```dockerfile
# Already in our Dockerfile
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001
USER nodejs  # Don't run as root
```

### Network Isolation

```bash
# Services only accessible to each other
# Frontend can't directly access database
# Only backend can access database

# External access only through exposed ports:
# Frontend: http://localhost:3000
# Backend: http://localhost:5000
# Database: Only available to backend
```

### Resource Limits

```yaml
# In docker-compose.yml
services:
  backend:
    deploy:
      resources:
        limits:
          cpus: '0.5'
          memory: 512M
        reservations:
          cpus: '0.25'
          memory: 256M
```

---

## 🚀 Production Deployment with Docker

### Build Images for Production

```bash
# Build with BuildKit for better caching
DOCKER_BUILDKIT=1 docker build -t myregistry/api-hub-backend:1.0.0 -f backend/Dockerfile .
DOCKER_BUILDKIT=1 docker build -t myregistry/api-hub-frontend:1.0.0 -f frontend/Dockerfile .

# Push to registry
docker push myregistry/api-hub-backend:1.0.0
docker push myregistry/api-hub-frontend:1.0.0
```

### Docker on Server

```bash
# Login to registry
docker login myregistry.com

# Pull images
docker pull myregistry/api-hub-backend:1.0.0
docker pull myregistry/api-hub-frontend:1.0.0

# Run production compose file
docker-compose -f docker-compose.prod.yml up -d

# Monitor
docker-compose -f docker-compose.prod.yml ps
docker-compose -f docker-compose.prod.yml logs -f
```

---

## 🔧 Troubleshooting Docker

### Container Won't Start

```bash
# Check logs
docker-compose logs backend

# Common issues:
# 1. Port already in use
docker ps | grep 5000
kill $(lsof -t -i :5000)

# 2. Database connection failed
docker-compose logs postgres

# 3. Environment variables missing
docker-compose config | grep ANTHROPIC_API_KEY
```

### Services Can't Communicate

```bash
# Verify network
docker network inspect api-hub-network

# Check service name resolution
docker-compose exec backend ping postgres

# Verify URL format
# Should be: postgresql://user:pass@postgres:5432/db
# NOT: postgresql://user:pass@localhost:5432/db
```

### Slow Performance

```bash
# Check resource usage
docker stats

# Limit resources if needed
docker-compose up -d --scale backend=1

# Check for memory leaks
docker logs api-hub-backend | grep memory

# Restart service
docker-compose restart backend
```

### Database Issues

```bash
# Check database is running
docker-compose ps postgres

# Check database logs
docker-compose logs postgres

# Connect and verify
docker-compose exec postgres psql -U api_hub_user -d api_hub_db -c "SELECT 1;"

# Reset database
docker-compose down -v
docker-compose up postgres
# Wait for health check
docker-compose exec postgres pg_isready
```

---

## 📈 Monitoring Docker Containers

### Health Status

```bash
# All services should be "healthy" or "running"
docker-compose ps

# Check health status
docker inspect api-hub-backend | grep -A 10 Health

# View health check logs
docker inspect api-hub-postgres | grep -A 15 Health
```

### Performance Monitoring

```bash
# Real-time stats
docker stats

# Historical stats
docker stats --no-stream

# Memory usage
docker stats --no-stream | grep -E "api-hub|memory"

# CPU usage
docker stats --no-stream | grep -E "api-hub|cpu"
```

### Log Analysis

```bash
# Full logs
docker-compose logs backend

# Last 50 lines
docker-compose logs --tail=50 backend

# Timestamps
docker-compose logs --timestamps backend

# Errors only
docker-compose logs backend | grep -i error

# Follow real-time
docker-compose logs -f --tail=20 backend
```

---

## 🧹 Cleanup

### Remove Unused Images

```bash
# Remove dangling images
docker image prune

# Remove all unused images
docker image prune -a

# Remove specific image
docker rmi api-hub-backend:latest
```

### Remove Unused Volumes

```bash
# List volumes
docker volume ls

# Remove specific volume
docker volume rm api-hub_postgres_data

# Remove all unused volumes
docker volume prune

# Warning: This deletes data!
```

### Remove Unused Networks

```bash
# List networks
docker network ls

# Remove unused networks
docker network prune
```

### Complete Cleanup

```bash
# Warning: Deletes all stopped containers, unused images, networks, and volumes
docker system prune -a --volumes

# More conservative
docker system prune  # Keeps data volumes
```

---

## 📚 Docker Resources

- [Docker Documentation](https://docs.docker.com)
- [Docker Compose Reference](https://docs.docker.com/compose/compose-file/)
- [Best Practices](https://docs.docker.com/develop/dev-best-practices/)
- [Docker CLI Reference](https://docs.docker.com/engine/reference/commandline/cli/)

---

**Docker makes deployment consistent and removes "works on my machine" problems!**

Use Docker Compose for local development, and push to registry for production deployment.

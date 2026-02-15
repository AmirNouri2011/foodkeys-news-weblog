# FoodKeys Weblog - Deployment Guide

This directory contains all the necessary files to deploy the FoodKeys Weblog application using Docker.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Docker Compose Stack                      │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌─────────────────┐          ┌─────────────────────────┐   │
│  │                 │          │                         │   │
│  │   Next.js App   │◄────────►│   PostgreSQL 16        │   │
│  │   (Port 3000)   │          │   (Port 5432)          │   │
│  │                 │          │                         │   │
│  └─────────────────┘          └─────────────────────────┘   │
│           │                              │                   │
│           ▼                              ▼                   │
│  ┌─────────────────┐          ┌─────────────────────────┐   │
│  │  uploads_data   │          │    postgres_data        │   │
│  │    (Volume)     │          │      (Volume)           │   │
│  └─────────────────┘          └─────────────────────────┘   │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## Quick Start

### 1. Configure Environment

Copy the example environment file and configure it:

```bash
# From project root
cp .env.example .env
```

Edit `.env` with your production values:
- `POSTGRES_PASSWORD` - Set a strong password
- `API_KEY` - Set a secure API key for authentication
- `TOTP_SECRET` - Generate a new TOTP secret
- `NEXT_PUBLIC_SITE_URL` - Your production URL

### 2. Build and Start

```bash
# Build images
npm run docker:build

# Start services (PostgreSQL + App)
npm run docker:up

# Run database migrations
npm run docker:migrate

# Seed database with initial data (optional)
npm run docker:seed
```

### 3. Access the Application

- **Web Application**: http://localhost:3000
- **Database**: localhost:5432 (use Prisma Studio or any PostgreSQL client)

## Docker Commands

| Command | Description |
|---------|-------------|
| `npm run docker:build` | Build Docker images |
| `npm run docker:up` | Start all services |
| `npm run docker:down` | Stop all services |
| `npm run docker:logs` | View logs (follow mode) |
| `npm run docker:migrate` | Run database migrations |
| `npm run docker:seed` | Seed database with sample data |

## Files Overview

| File | Purpose |
|------|---------|
| `Dockerfile` | Production build for Next.js app |
| `Dockerfile.seed` | Image for database seeding |
| `docker-compose.yml` | Main orchestration file |
| `init-db/01-init.sql` | PostgreSQL initialization script |

## Production Deployment

### Using Docker Compose (Recommended for small deployments)

1. Set up a Linux server with Docker and Docker Compose installed
2. Clone the repository
3. Configure environment variables
4. Run the deployment commands above

### Using Container Orchestration (Kubernetes, etc.)

The Dockerfile produces a standalone Next.js build that can be deployed to:
- Kubernetes
- AWS ECS
- Google Cloud Run
- Azure Container Apps
- Any container orchestration platform

### Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `DATABASE_URL` | Yes | - | PostgreSQL connection string |
| `POSTGRES_USER` | Yes | foodkeys | Database username |
| `POSTGRES_PASSWORD` | Yes | - | Database password |
| `POSTGRES_DB` | Yes | foodkeys_db | Database name |
| `API_KEY` | Yes | - | API authentication key |
| `TOTP_SECRET` | Yes | - | TOTP 2FA secret |
| `NEXT_PUBLIC_SITE_URL` | Yes | - | Public site URL |
| `NEXT_PUBLIC_SITE_NAME` | No | FoodKeys Weblog | Site name |
| `APP_PORT` | No | 3000 | Application port |

## SSL/HTTPS Setup

For production, use a reverse proxy like Nginx or Traefik:

### Using Nginx (example)

```nginx
server {
    listen 80;
    server_name yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## Database Backups

### Manual Backup

```bash
docker exec foodkeys-postgres pg_dump -U foodkeys foodkeys_db > backup_$(date +%Y%m%d_%H%M%S).sql
```

### Restore Backup

```bash
cat backup.sql | docker exec -i foodkeys-postgres psql -U foodkeys foodkeys_db
```

## Troubleshooting

### View Logs

```bash
# All services
docker-compose -f deploy/docker-compose.yml logs

# Specific service
docker-compose -f deploy/docker-compose.yml logs app
docker-compose -f deploy/docker-compose.yml logs postgres
```

### Database Connection Issues

```bash
# Check if PostgreSQL is healthy
docker exec foodkeys-postgres pg_isready -U foodkeys

# Connect to database
docker exec -it foodkeys-postgres psql -U foodkeys -d foodkeys_db
```

### Reset Everything

```bash
# Stop and remove everything including volumes
docker-compose -f deploy/docker-compose.yml down -v

# Rebuild from scratch
npm run docker:build
npm run docker:up
npm run docker:migrate
npm run docker:seed
```

## Health Checks

The application includes health check endpoints:
- App health: `http://localhost:3000/` (returns 200 for healthy)
- Database health: Monitored by Docker health check

## Security Recommendations

1. **Change default credentials**: Never use default passwords in production
2. **Use secrets management**: Consider using Docker secrets or external secret managers
3. **Enable SSL/TLS**: Always use HTTPS in production
4. **Firewall**: Only expose necessary ports
5. **Regular updates**: Keep Docker images and dependencies updated
6. **Backup regularly**: Set up automated database backups

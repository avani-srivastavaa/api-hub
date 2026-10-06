# 🚀 Deployment Guide - Universal AI API Hub

Complete guide for deploying the full-stack application to production.

---

## 📋 Prerequisites

- Node.js 18+ and npm
- PostgreSQL 12+ (or use Railway)
- Git repository
- Hosting account (Railway, Render, Vercel, or similar)

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────┐
│   React Frontend (Vite)                 │
│   - Runs on port 3000 locally           │
│   - Built to dist/ for production       │
└────────────────┬────────────────────────┘
                 │ API Calls
                 ▼
┌─────────────────────────────────────────┐
│   Express Backend (Node.js)             │
│   - Runs on port 5000 locally           │
│   - Deployed as main service            │
└────────────────┬────────────────────────┘
                 │ Queries
                 ▼
┌─────────────────────────────────────────┐
│   PostgreSQL Database                   │
│   - Contains all connector configs      │
│   - Stores request logs and stats       │
└─────────────────────────────────────────┘
```

---

## 📦 Option 1: Deploy to Railway (Recommended)

Railway handles both frontend and backend with auto-deployment.

### Step 1: Prepare GitHub Repository

```bash
# From project root
git add .
git commit -m "Ready for production"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/api-hub.git
git push -u origin main
```

### Step 2: Create Railway Account & Project

1. Go to https://railway.app
2. Sign up with GitHub
3. Create new project
4. Connect your GitHub repository

### Step 3: Add PostgreSQL Database

1. In Railway dashboard, click "New"
2. Select "PostgreSQL"
3. Wait for database to provision
4. Copy connection details

### Step 4: Configure Environment Variables

In Railway dashboard, set these variables:

**Backend (.env)**:
```
NODE_ENV=production
PORT=5000
DATABASE_URL=postgresql://[user]:[password]@[host]:[port]/[db]
ANTHROPIC_API_KEY=sk-ant-...
OPENAI_API_KEY=sk-...
GEMINI_API_KEY=...
JWT_SECRET=your-secret-key-here
ENCRYPTION_KEY=your-encryption-key-here
```

**Frontend (.env)**:
```
VITE_API_URL=https://your-app.railway.app
VITE_ENABLE_ADVANCED_TESTING=true
```

### Step 5: Deploy Backend Service

1. In Railway, create new "Service"
2. Select your GitHub repo
3. Set root directory to `backend`
4. Start command: `npm run migrate && npm run seed && npm start`
5. Add environment variables
6. Deploy

### Step 6: Deploy Frontend

1. Create new "Service"
2. Select your GitHub repo
3. Set root directory to `frontend`
4. Build command: `npm run build`
5. Start command: `npm run preview` (or use Vercel for static hosting)
6. Add environment variables
7. Deploy

### Step 7: Verify Deployment

```bash
# Test backend
curl https://your-app.railway.app/health

# Test frontend
# Open https://your-app.railway.app in browser
```

---

## 🌐 Option 2: Separate Deployment (Backend + Frontend)

### Backend on Railway

```bash
# backend/.env.production
NODE_ENV=production
DATABASE_URL=postgresql://...
ANTHROPIC_API_KEY=sk-ant-...
OPENAI_API_KEY=sk-...
GEMINI_API_KEY=...
```

1. Create Railway project
2. Add PostgreSQL
3. Deploy backend service
4. Get backend URL (e.g., `https://your-api.railway.app`)

### Frontend on Vercel

```bash
# frontend/.env.production
VITE_API_URL=https://your-api.railway.app
```

1. Connect GitHub to Vercel
2. Select `frontend` folder
3. Set environment variable
4. Deploy

### Connect Them

Update frontend `.env.production` to point to deployed backend URL.

---

## 🔧 Option 3: Self-Hosted (VPS/Dedicated Server)

### Requirements

- Ubuntu 20.04+ server
- SSH access
- Domain name

### Installation Steps

```bash
# 1. Update system
ssh user@your-server.com
sudo apt update && sudo apt upgrade -y

# 2. Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install nodejs -y

# 3. Install PostgreSQL
sudo apt install postgresql postgresql-contrib -y
sudo systemctl start postgresql
sudo systemctl enable postgresql

# 4. Create database
sudo -u postgres psql
CREATE DATABASE api_hub_db;
CREATE USER api_hub_user WITH PASSWORD 'secure_password';
GRANT ALL PRIVILEGES ON DATABASE api_hub_db TO api_hub_user;
\q

# 5. Clone repository
git clone https://github.com/YOUR_USERNAME/api-hub.git
cd api-hub

# 6. Install dependencies
npm install
cd frontend && npm install && npm run build && cd ..

# 7. Set environment variables
cp backend/.env.example backend/.env
# Edit backend/.env with production values

# 8. Initialize database
cd backend
npm run migrate
npm run seed

# 9. Install PM2 for process management
sudo npm install -g pm2

# 10. Start backend
pm2 start src/server.js --name "api-hub-backend"
pm2 start "npm run preview" --cwd "../frontend" --name "api-hub-frontend"
pm2 startup
pm2 save
```

### Set Up Reverse Proxy (Nginx)

```bash
# Install Nginx
sudo apt install nginx -y

# Create config file
sudo nano /etc/nginx/sites-available/api-hub
```

**Nginx Configuration** (`/etc/nginx/sites-available/api-hub`):

```nginx
upstream backend {
  server localhost:5000;
}

upstream frontend {
  server localhost:5173;
}

server {
  listen 80;
  server_name your-domain.com www.your-domain.com;

  # Redirect HTTP to HTTPS
  return 301 https://$server_name$request_uri;
}

server {
  listen 443 ssl http2;
  server_name your-domain.com www.your-domain.com;

  # SSL certificates (from Let's Encrypt)
  ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
  ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;

  # Static files
  location / {
    proxy_pass http://frontend;
  }

  # API calls
  location /api {
    proxy_pass http://backend;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
  }
}
```

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/api-hub /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx

# Install SSL certificate
sudo apt install certbot python3-certbot-nginx -y
sudo certbot certonly --nginx -d your-domain.com
```

---

## 🔐 Security Checklist

- [ ] Set `NODE_ENV=production`
- [ ] Use strong secrets for `JWT_SECRET` and `ENCRYPTION_KEY`
- [ ] Enable HTTPS/SSL
- [ ] Set up firewall rules
- [ ] Rotate API keys regularly
- [ ] Enable database backups
- [ ] Set up monitoring/alerting
- [ ] Use environment variables (never commit secrets)
- [ ] Enable CORS only for your domain

---

## 📊 Monitoring & Logging

### Backend Logs

```bash
# View logs
pm2 logs api-hub-backend

# Persistent logging
pm2 install pm2-logrotate
```

### Database Backups

```bash
# PostgreSQL backup
pg_dump api_hub_db > backup.sql

# Automated daily backup
sudo crontab -e
# Add: 0 2 * * * pg_dump api_hub_db > /backups/api_hub_$(date +\%Y\%m\%d).sql
```

### Error Tracking

Consider integrating:
- Sentry (error tracking)
- Datadog (monitoring)
- LogRocket (session replay)

---

## 🚀 Scaling for Production

### Database Optimization

```sql
-- Add indexes if not already present
CREATE INDEX idx_request_logs_created ON request_logs(created_at DESC);
CREATE INDEX idx_connectors_status ON connectors(status);

-- Monitor performance
EXPLAIN ANALYZE SELECT * FROM request_logs LIMIT 10;
```

### Caching

Add Redis for caching:

```javascript
// Example: Cache connector list
import redis from 'redis';
const client = redis.createClient();

app.get('/api/admin/connectors', async (req, res) => {
  const cached = await client.get('connectors');
  if (cached) return res.json(JSON.parse(cached));
  
  const data = await fetchFromDB();
  await client.setex('connectors', 3600, JSON.stringify(data));
  res.json(data);
});
```

### Load Balancing

```nginx
upstream backend {
  server backend1.internal:5000;
  server backend2.internal:5000;
  server backend3.internal:5000;
}

server {
  listen 80;
  location /api {
    proxy_pass http://backend;
  }
}
```

---

## 🧪 Testing Before Production

```bash
# 1. Test locally
npm run dev

# 2. Build for production
cd frontend && npm run build

# 3. Test built frontend
npm run preview

# 4. Run smoke tests
curl http://localhost:5000/health
curl http://localhost:5000/api/system

# 5. Create test connector
curl -X POST http://localhost:5000/api/admin/connectors \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","provider":"anthropic",...}'

# 6. Test end-to-end
curl -X POST http://localhost:5000/api/connectors/test \
  -H "Content-Type: application/json" \
  -d '{"sample":"data"}'
```

---

## 📞 Troubleshooting

### Backend won't start
```bash
# Check logs
pm2 logs api-hub-backend

# Verify database connection
pg_isready -h localhost -U api_hub_user

# Check environment variables
printenv | grep DATABASE_URL
```

### Frontend can't connect to API
```bash
# Check CORS settings
curl -i http://localhost:5000/api/system

# Verify API URL in .env
cat frontend/.env

# Check network tab in browser DevTools
```

### Database connection fails
```bash
# Test connection
psql postgresql://user:pass@host:5432/db

# Check credentials
echo $DATABASE_URL
```

---

## 📈 Performance Monitoring

```bash
# Backend performance
node --prof src/server.js
node --prof-process isolate-*.log | head -20

# Database query performance
EXPLAIN ANALYZE SELECT * FROM request_logs LIMIT 1000;
```

---

## 🎯 Production Checklist

- [ ] All environment variables set
- [ ] Database initialized and backed up
- [ ] SSL/HTTPS configured
- [ ] Frontend built and deployed
- [ ] API accessible from production URL
- [ ] Health checks passing
- [ ] Sample connector created and tested
- [ ] Error logging configured
- [ ] Database backups scheduled
- [ ] Monitoring and alerts set up
- [ ] Team has access to logs
- [ ] Documentation updated

---

## 🆘 Getting Help

- Check logs: `pm2 logs` or Railway dashboard
- Review API documentation: `GET /api/docs`
- Test endpoints: Postman collection available
- GitHub issues for bugs: https://github.com/YOUR_USERNAME/api-hub/issues

---

**Deployment successful!** 🎉

Your API Hub is now running in production. Monitor it closely in the first few hours to catch any issues.

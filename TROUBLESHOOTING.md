# 🔧 Troubleshooting & Error Handling Guide

Complete guide for diagnosing and fixing common issues in the API Hub.

---

## 📋 Common Issues & Solutions

### Backend Issues

#### 1. Backend Won't Start

**Error**: `Error: connect ECONNREFUSED 127.0.0.1:5432`

**Cause**: PostgreSQL is not running

**Solution**:
```bash
# Check if PostgreSQL is running
psql --version

# Start PostgreSQL
# macOS (Homebrew)
brew services start postgresql

# Ubuntu/Debian
sudo systemctl start postgresql

# Windows (via Services)
# Open Services -> Find PostgreSQL -> Start

# Docker
docker-compose up postgres
```

---

#### 2. Database Connection Fails

**Error**: `FATAL: role "api_hub_user" does not exist`

**Cause**: Database user not created

**Solution**:
```bash
# Connect to PostgreSQL as admin
sudo -u postgres psql

# Create user and database
CREATE USER api_hub_user WITH PASSWORD 'secure_password';
CREATE DATABASE api_hub_db OWNER api_hub_user;

# Verify
\du  # List users
\l   # List databases

# Exit
\q
```

---

#### 3. Migration Fails

**Error**: `error: relation "connectors" already exists`

**Cause**: Database already initialized or migration ran twice

**Solution**:
```bash
# Option 1: Use existing database (if data is safe)
# Edit .env and ensure correct DATABASE_URL

# Option 2: Reset database (CAREFUL - deletes all data)
cd backend

# Backup first
pg_dump $DATABASE_URL > backup.sql

# Drop and recreate
psql $DATABASE_URL -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"

# Re-migrate
npm run migrate
npm run seed
```

---

#### 4. API Keys Not Working

**Error**: `Error: ANTHROPIC_API_KEY is not set`

**Cause**: Environment variables not loaded

**Solution**:
```bash
# Check .env file exists
ls -la backend/.env

# Verify content
cat backend/.env

# Check environment is loaded
node -e "console.log(process.env.ANTHROPIC_API_KEY)"

# Restart server after changing .env
npm run dev
```

**Important**: Never commit `.env` file to Git!

---

#### 5. Port Already in Use

**Error**: `Error: listen EADDRINUSE: address already in use :::5000`

**Cause**: Another process using port 5000

**Solution**:
```bash
# Find what's using port 5000
lsof -i :5000

# Kill the process
kill -9 <PID>

# Or use different port
PORT=5001 npm run dev

# Or stop Docker containers
docker-compose down
```

---

#### 6. Seed Data Not Loaded

**Error**: No connectors visible after migration

**Cause**: Seed script didn't run

**Solution**:
```bash
cd backend

# Run seed manually
npm run seed

# Check if data loaded
npm run db-test

# Verify in database
psql $DATABASE_URL -c "SELECT COUNT(*) FROM connectors;"
```

---

### Frontend Issues

#### 1. Frontend Won't Load

**Error**: Blank page or 404

**Cause**: Dev server not running or API URL incorrect

**Solution**:
```bash
# Check dev server is running
npm run dev

# Verify port is correct (usually 5173)
# Check browser console for errors

# Verify API URL
cat frontend/.env.local

# Should show:
# VITE_API_URL=http://localhost:5000
```

---

#### 2. API Calls Failing

**Error**: Network error or CORS error in console

**Cause**: Backend not running or unreachable

**Solution**:
```bash
# 1. Check backend is running
curl http://localhost:5000/health

# Should return:
# {"status":"ok","uptime":...}

# 2. Check API URL in .env
cat frontend/.env.local

# 3. Check browser Network tab
# - See failed requests
# - Check response status codes
# - Look for CORS errors

# 4. If CORS error, backend config may need update
# In backend/src/server.js, verify CORS settings:
# app.use(cors({
#   origin: 'http://localhost:5173',
#   credentials: true
# }));
```

---

#### 3. Styles Not Loading

**Error**: Page looks unstyled, missing Tailwind CSS

**Cause**: CSS not compiled or Tailwind not processing

**Solution**:
```bash
cd frontend

# Clear cache and rebuild
rm -rf node_modules dist .vite
npm install
npm run dev

# Check tailwind.config.js exists
ls tailwind.config.js

# Verify index.css has Tailwind imports
head -5 src/index.css
# Should see:
# @tailwind base;
# @tailwind components;
# @tailwind utilities;
```

---

#### 4. Components Not Rendering

**Error**: Blank sections or missing page content

**Cause**: API call failing silently or component error

**Solution**:
```javascript
// Open browser DevTools Console (F12)
// Look for error messages

// Check for 404 errors in Network tab
// API endpoints should return 200 or meaningful error codes

// Verify store state
// In browser console:
useConnectorStore.getState()

// Check if data is loading
// Look for loading spinners or loading state
```

---

#### 5. Form Not Submitting

**Error**: Form submission fails silently

**Cause**: Validation error or API error

**Solution**:
```bash
# Check browser console for errors
# Press F12 -> Console tab

# Verify form data
# In Network tab, check POST request payload

# Check validation rules
# Edit CreateConnector.jsx for validation logic

# Test API endpoint manually
curl -X POST http://localhost:5000/api/admin/connectors \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Connector",
    "provider": "anthropic",
    "model": "claude-3-5-sonnet-20241022",
    "system_prompt": "You are helpful"
  }'
```

---

### Database Issues

#### 1. Database Connection Timeout

**Error**: `Error: query timeout`

**Cause**: Database overloaded or network issue

**Solution**:
```bash
# Check if PostgreSQL is responsive
psql $DATABASE_URL -c "SELECT 1"

# Check connection pool
# Look at backend logs for connection errors

# Restart PostgreSQL
sudo systemctl restart postgresql

# Or in Docker
docker-compose restart postgres
```

---

#### 2. Disk Space Full

**Error**: `Error: No space left on device`

**Cause**: PostgreSQL data directory full

**Solution**:
```bash
# Check disk space
df -h

# Find large files
du -sh /var/lib/postgresql/* 2>/dev/null

# Backup and cleanup old logs
pg_dump $DATABASE_URL > backup.sql
psql $DATABASE_URL -c "VACUUM FULL;"

# Or delete old test data
psql $DATABASE_URL -c "DELETE FROM request_logs WHERE created_at < NOW() - INTERVAL '7 days';"
```

---

#### 3. Corrupted Database

**Error**: `Error: invalid page in block ... LSN`

**Cause**: Unexpected shutdown or disk error

**Solution**:
```bash
# Attempt recovery
sudo -u postgres pg_rewind --target-pgdata /var/lib/postgresql/main --source-server="dbname=postgres"

# Or restore from backup
psql < backup.sql

# If unrecoverable, reinitialize
npm run migrate
npm run seed
```

---

### Docker Issues

#### 1. Container Won't Start

**Error**: Container exits immediately

**Solution**:
```bash
# Check logs
docker-compose logs backend

# Common issues:
# - PORT already in use
# - DATABASE_URL invalid
# - Missing environment variables

# Rebuild images
docker-compose build --no-cache

# Start fresh
docker-compose down -v
docker-compose up
```

---

#### 2. Containers Can't Communicate

**Error**: Backend can't reach postgres

**Cause**: Network not connected properly

**Solution**:
```bash
# Verify network
docker network ls
docker network inspect api-hub-network

# Check service names in docker-compose.yml
# Backend should use: postgresql://postgres:5432/...

# Rebuild network
docker-compose down -v
docker-compose up --build
```

---

### Provider Integration Issues

#### 1. API Key Invalid

**Error**: `Error: 401 Unauthorized` or `Invalid API key`

**Cause**: Wrong API key or expired

**Solution**:
```bash
# Verify API keys
echo $ANTHROPIC_API_KEY
echo $OPENAI_API_KEY
echo $GEMINI_API_KEY

# Test API key manually
curl https://api.anthropic.com/v1/messages \
  -H "x-api-key: $ANTHROPIC_API_KEY" \
  -H "anthropic-version: 2023-06-01" \
  -H "content-type: application/json" \
  -d '{"model":"claude-3-5-sonnet-20241022","max_tokens":100,"messages":[{"role":"user","content":"test"}]}'

# If fails, regenerate API key from provider dashboard
```

---

#### 2. Rate Limit Exceeded

**Error**: `Error: 429 Too Many Requests`

**Cause**: API rate limit hit

**Solution**:
```bash
# Wait before making more requests
# Check provider rate limits:
# - OpenAI: 3,500 req/min (free tier: 60 req/min)
# - Anthropic: 50,000 tokens/min (varies by plan)
# - Google: 1,500 req/min (free tier)

# Add exponential backoff retry logic
# See backend/providers/BaseProvider.js for retry mechanism
```

---

#### 3. Model Not Available

**Error**: `Error: model not found`

**Cause**: Model name incorrect or not available

**Solution**:
```bash
# List available models

# For OpenAI:
curl https://api.openai.com/v1/models \
  -H "Authorization: Bearer $OPENAI_API_KEY"

# For Anthropic (hardcoded in provider):
# Claude 3.5 Sonnet: claude-3-5-sonnet-20241022
# Claude 3 Opus: claude-3-opus-20240229
# Claude 3 Sonnet: claude-3-sonnet-20240229

# For Google Gemini:
# gemini-pro
# gemini-pro-vision
```

---

## 🔍 Debugging Techniques

### Enable Debug Logging

```javascript
// In backend/src/server.js
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  console.log('Body:', req.body);
  next();
});

// In frontend components
console.log('Store state:', useConnectorStore.getState());
console.log('API response:', response.data);
```

### Check Logs

```bash
# Backend logs (if running locally)
# Check terminal output

# Backend logs (Docker)
docker-compose logs -f backend

# Frontend logs
# Open browser DevTools: F12 -> Console

# Database logs
docker-compose logs -f postgres
```

### Inspect Database

```bash
# Connect to database
psql $DATABASE_URL

# Common queries
SELECT * FROM connectors;
SELECT COUNT(*) FROM request_logs;
SELECT * FROM request_logs LIMIT 10;

# Check table structure
\d connectors
\d request_logs

# View statistics
SELECT name, total_requests, estimated_total_cost FROM connector_stats;
```

### Test API Endpoints

```bash
# Health check
curl http://localhost:5000/health

# System info
curl http://localhost:5000/api/system

# List connectors
curl http://localhost:5000/api/admin/connectors

# Get specific connector
curl http://localhost:5000/api/admin/connectors/{id}

# Test connector
curl -X POST http://localhost:5000/api/admin/test/{id} \
  -H "Content-Type: application/json" \
  -d '{"test_input": {"key": "value"}}'
```

---

## 🚨 Error Codes & Meanings

### HTTP Status Codes

| Code | Meaning | Action |
|------|---------|--------|
| 200 | OK | Request succeeded |
| 201 | Created | Resource created successfully |
| 400 | Bad Request | Invalid input, check request body |
| 401 | Unauthorized | API key missing or invalid |
| 404 | Not Found | Resource doesn't exist |
| 422 | Unprocessable Entity | Validation error |
| 500 | Server Error | Backend error, check logs |
| 503 | Service Unavailable | Database or provider down |

### Common Error Messages

#### Backend Errors

```
"Database connection failed"
→ PostgreSQL not running or URL incorrect

"API key not found"
→ Set ANTHROPIC_API_KEY, OPENAI_API_KEY, or GEMINI_API_KEY

"Connector not found"
→ ID doesn't exist, verify connector ID

"Invalid input schema"
→ Input fields don't match schema, check request body

"Provider error"
→ AI provider API failed, check API key and rate limits
```

#### Frontend Errors

```
"Failed to load connectors"
→ Backend API unavailable or network error

"Failed to create connector"
→ Form validation error or API error, check console

"CORS error"
→ Frontend URL not allowed by backend CORS settings

"Cannot read property 'data'"
→ API response format unexpected, check backend response
```

---

## ✅ Health Checks

### Backend Health

```bash
curl http://localhost:5000/health

# Expected response:
# {"status":"ok","uptime":123.456}
```

### Database Health

```bash
curl http://localhost:5000/api/db-test

# Expected response:
# {"success":true,"message":"Database connection successful"}
```

### Full System Check

```bash
# 1. Backend running?
curl http://localhost:5000/health

# 2. Database connected?
curl http://localhost:5000/api/db-test

# 3. Frontend accessible?
curl http://localhost:5173

# 4. API endpoints working?
curl http://localhost:5000/api/admin/connectors

# 5. Providers available?
curl http://localhost:5000/api/system | grep -i providers
```

---

## 📊 Performance Troubleshooting

### Slow API Responses

**Problem**: API calls taking > 1000ms

**Solutions**:
```bash
# 1. Check database performance
EXPLAIN ANALYZE SELECT * FROM connectors;

# 2. Check network latency
ping api.provider.com

# 3. Check AI provider response time
# Log response times in BaseProvider._callProvider()

# 4. Monitor database connections
psql $DATABASE_URL -c "SELECT count(*) FROM pg_stat_activity;"

# 5. Enable query logging
# In PostgreSQL: SET log_min_duration_statement = 1000;
```

### High Memory Usage

**Problem**: Node.js process using > 500MB

**Solutions**:
```bash
# Check memory usage
ps aux | grep node

# 1. Increase Node memory limit
NODE_OPTIONS=--max-old-space-size=2048 npm run dev

# 2. Check for memory leaks
# Add: require('heapdump').writeSnapshot();
# Generate heap dump and analyze

# 3. Reduce logging verbosity
# Comment out debug console.log statements
```

### High Database CPU

**Problem**: PostgreSQL consuming > 80% CPU

**Solutions**:
```bash
# 1. Check slow queries
SELECT query, mean_time FROM pg_stat_statements 
ORDER BY mean_time DESC LIMIT 5;

# 2. Add missing indexes
CREATE INDEX idx_request_logs_status ON request_logs(status);

# 3. Analyze query plan
EXPLAIN ANALYZE SELECT * FROM request_logs WHERE status = 'success';

# 4. Vacuum bloated tables
VACUUM ANALYZE request_logs;
```

---

## 📞 Getting Help

### Before Requesting Help

1. Check this guide first
2. Check browser console for errors (F12)
3. Check backend logs: `npm run dev`
4. Test with cURL/Postman
5. Check database state
6. Review error messages carefully

### Information to Provide

When asking for help, provide:
- Error message (exact text)
- Steps to reproduce
- Operating system and Node.js version
- .env file (without secrets!)
- Recent logs from both backend and frontend
- What you've already tried

### Useful Commands for Debugging

```bash
# Backend info
node --version
npm --version
npm list express
npm list pg

# Database info
psql --version
pg_dump --version

# System info
uname -a
df -h
free -h

# Network info
curl -i http://localhost:5000/health
netstat -tuln | grep 5000
lsof -i :5000

# Docker info (if using Docker)
docker --version
docker ps
docker-compose logs backend
```

---

## 🎯 Prevention Tips

### Regular Maintenance

```bash
# Weekly
# - Check logs for errors
# - Verify backups work
# - Test API endpoints

# Monthly
# - Run VACUUM on PostgreSQL
# - Review API usage and costs
# - Update dependencies
# - Check for security updates

# Quarterly
# - Performance review
# - Capacity planning
# - Security audit
```

### Monitoring

```bash
# Setup error tracking
# - Use Sentry.io
# - Monitor status.io
# - Set up alerts

# Monitor costs
# - Track AI provider usage
# - Review monthly bills
# - Set API quotas

# Monitor performance
# - Track response times
# - Monitor database size
# - Track request volumes
```

---

**Most issues can be resolved by checking logs, verifying environment variables, and restarting services.**

If problems persist, enable debug mode and check logs carefully.

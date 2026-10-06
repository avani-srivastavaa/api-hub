# 🚀 Complete Getting Started Guide

Your complete roadmap to getting the API Hub up and running, from zero to production.

---

## 📚 Table of Contents

1. [**Project Overview**](#-project-overview) - What is this?
2. [**System Requirements**](#-system-requirements) - What do you need?
3. [**Installation Options**](#-installation-options) - Choose your path
4. [**First Run**](#-first-run) - Get it running in 5 minutes
5. [**Verify Installation**](#-verify-installation) - Make sure it works
6. [**Create Your First Connector**](#-create-your-first-connector) - Test it out
7. [**Next Steps**](#-next-steps) - Where to go from here
8. [**Getting Help**](#-getting-help) - Troubleshooting

---

## 🎯 Project Overview

**Universal AI API Connector & Hub** is a production-ready platform for creating, managing, and deploying reusable AI API connectors.

### What Can You Do?

✅ **Create AI connectors** without writing code
✅ **Call multiple AI providers** (OpenAI, Anthropic, Google)
✅ **Track usage & costs** automatically
✅ **Auto-generate documentation** for each connector
✅ **Test connectors** in real-time
✅ **Manage everything** through a modern web dashboard

### Example Use Cases

- **Image Analysis**: Upload business card → Extract contact info
- **Content Generation**: Write articles, social media posts, emails
- **Document Processing**: Parse invoices, contracts, forms
- **Data Transformation**: Rewrite, summarize, translate content

---

## 🖥️ System Requirements

### Minimum Requirements

- **CPU**: 2 cores (4+ cores recommended)
- **RAM**: 4GB (8GB recommended for production)
- **Disk**: 10GB (50GB+ for production)
- **OS**: macOS, Linux, or Windows (with WSL2)

### Required Software

Choose ONE installation path:

**Option A: Local (Recommended for Development)**
- Node.js 16+ (18+ recommended)
- PostgreSQL 12+
- npm or yarn

**Option B: Docker (Recommended for Production)**
- Docker Desktop 4.0+
- No database installation needed

### API Keys Required

Sign up for free accounts:

1. **Anthropic** (Claude): https://console.anthropic.com
2. **OpenAI** (GPT-4): https://platform.openai.com
3. **Google** (Gemini): https://ai.google.dev

(You only need ONE to start, but multiple is better for testing)

---

## 🛣️ Installation Options

### ⭐ OPTION A: Docker (5 minutes, Recommended)

**Easiest way to get started. All-in-one setup.**

```bash
# 1. Clone repository
git clone https://github.com/yourusername/api-hub.git
cd api-hub

# 2. Create environment file
cat > .env << EOF
DB_USER=api_hub_user
DB_PASSWORD=secure_password_123
DB_NAME=api_hub_db
ANTHROPIC_API_KEY=sk-ant-your-key-here
OPENAI_API_KEY=sk-your-key-here
GEMINI_API_KEY=your-key-here
EOF

# 3. Start with Docker Compose
docker-compose up

# Wait for "Backend is running on port 5000"

# 4. Open browser
# Frontend: http://localhost:3000
# Backend: http://localhost:5000
```

**That's it!** Your system is running.

See [DOCKER_GUIDE.md](DOCKER_GUIDE.md) for detailed Docker documentation.

---

### 🔧 OPTION B: Local Installation (15 minutes)

**Traditional setup. Full control, more manual steps.**

#### Step 1: Install Prerequisites

```bash
# Check versions
node --version  # Should be 16+
npm --version   # Should be 7+
psql --version  # PostgreSQL should be installed

# If PostgreSQL not installed:
# macOS: brew install postgresql@15
# Ubuntu: sudo apt install postgresql postgresql-contrib
# Windows: Download from postgresql.org
```

#### Step 2: Database Setup

```bash
# Start PostgreSQL
# macOS: brew services start postgresql@15
# Ubuntu: sudo systemctl start postgresql
# Windows: Services → Start PostgreSQL

# Create database and user
psql postgres

# In psql:
CREATE USER api_hub_user WITH PASSWORD 'secure_password';
CREATE DATABASE api_hub_db OWNER api_hub_user;
GRANT ALL PRIVILEGES ON DATABASE api_hub_db TO api_hub_user;
\q

# Verify
psql postgresql://api_hub_user:secure_password@localhost/api_hub_db -c "SELECT 1;"
```

#### Step 3: Backend Setup

```bash
# Navigate to backend
cd backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Edit .env with your values
nano .env  # or use your editor

# Key environment variables to set:
# DATABASE_URL=postgresql://api_hub_user:secure_password@localhost/api_hub_db
# ANTHROPIC_API_KEY=sk-ant-your-key-here
# OPENAI_API_KEY=sk-...
# GEMINI_API_KEY=...

# Initialize database
npm run migrate

# Seed with demo data
npm run seed

# Start backend
npm run dev

# Should see: Backend is running on port 5000
```

**Leave this terminal running.**

#### Step 4: Frontend Setup

**Open a NEW terminal window**

```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Create environment file
cp .env.example .env.local

# Set API URL (optional, defaults to localhost:5000)
echo "VITE_API_URL=http://localhost:5000" >> .env.local

# Start frontend
npm run dev

# Should see: Local: http://localhost:5173
```

**Backend**: http://localhost:5000
**Frontend**: http://localhost:5173

---

## 🎬 First Run

### What You Should See

#### Terminal 1 (Backend)
```
Backend is running on port 5000
Database connected successfully
```

#### Terminal 2 (Frontend)
```
VITE v5.0.0  ready in 123 ms

➜  Local:   http://localhost:5173/
```

#### Browser

1. Open http://localhost:5173
2. See dashboard with system status
3. Should show "All systems operational"

---

## ✅ Verify Installation

### Test 1: Health Check

```bash
curl http://localhost:5000/health

# Expected response:
# {"status":"ok","uptime":123.456}
```

### Test 2: Database Connection

```bash
curl http://localhost:5000/api/db-test

# Expected response:
# {"success":true,"message":"Database connection successful"}
```

### Test 3: System Info

```bash
curl http://localhost:5000/api/system | jq

# Should show:
# {
#   "service": {"name": "AI API Hub", "version": "1.0.0", ...},
#   "database": {"status": "connected", ...},
#   "providers": {"available": ["anthropic", "openai", "gemini"], ...}
# }
```

### Test 4: Demo Connectors

```bash
curl http://localhost:5000/api/admin/connectors | jq '.data | length'

# Should return: 4 (card-scanner, article-writer, invoice-parser, content-rewriter)
```

### Test 5: Frontend Dashboard

1. Go to http://localhost:5173
2. Click on "Connectors" in sidebar
3. See 4 demo connectors listed
4. Click one to view details

---

## 🎨 Create Your First Connector

### Via Frontend UI (Easiest)

1. Go to http://localhost:5173
2. Click "New Connector" button
3. Fill in form:
   - **Name**: "Hello Claude"
   - **Provider**: Anthropic
   - **Model**: claude-3-5-sonnet-20241022
   - **System Prompt**: "You are a helpful assistant that responds in one sentence."
4. Click "Create Connector"
5. See success message

### Test It

1. Go to Connectors → Hello Claude
2. Click "Test" button
3. Enter: `{"prompt": "Say hello to the API Hub"}`
4. See response from Claude!

### Via API (cURL)

```bash
# Create connector
curl -X POST http://localhost:5000/api/admin/connectors \
  -H "Content-Type: application/json" \
  -d '{
    "name": "My Connector",
    "description": "My first connector",
    "provider": "anthropic",
    "model": "claude-3-5-sonnet-20241022",
    "system_prompt": "You are helpful and concise."
  }'

# Test it
curl -X POST http://localhost:5000/api/connectors/my-connector \
  -H "Content-Type: application/json" \
  -d '{"prompt": "Hello"}'

# View docs
curl http://localhost:5000/api/docs/my-connector | jq
```

---

## 📚 Understand the Architecture

### Simple Overview

```
Your Browser
    ↓ HTTP/JSON
React Dashboard (Frontend)
    ↓ API Calls
Express API Server (Backend)
    ↓ Queries
PostgreSQL Database
    ↓ API Calls
OpenAI / Anthropic / Google
    ↓ Responses
Everything flows back to browser
```

### File Structure (Important Directories)

```
api-hub/
├── backend/
│   ├── src/
│   │   ├── server.js           ← Entry point
│   │   ├── routes/             ← All API endpoints
│   │   ├── models/             ← Database logic
│   │   ├── providers/          ← AI providers
│   │   └── migrations/         ← Database schema
│   ├── package.json            ← Dependencies
│   └── .env                    ← Secrets (never commit!)
│
├── frontend/
│   ├── src/
│   │   ├── pages/              ← React pages
│   │   ├── components/         ← React components
│   │   ├── services/           ← API calls
│   │   ├── store/              ← State management
│   │   └── App.jsx             ← Main component
│   ├── index.html
│   └── .env.local              ← Frontend config
│
├── docker-compose.yml          ← Docker setup
└── DOCUMENTATION FILES
    ├── README.md               ← You are here
    ├── API_DOCUMENTATION.md    ← API reference
    ├── DEPLOYMENT_GUIDE.md     ← Go live
    ├── TROUBLESHOOTING.md      ← Fix problems
    └── DOCKER_GUIDE.md         ← Docker details
```

---

## 🧭 Next Steps

### Immediate (Now)

- [ ] Get it running (follow above)
- [ ] Verify it works (run tests)
- [ ] Create a test connector
- [ ] Test a connector endpoint
- [ ] View dashboard

### Short Term (This Week)

- [ ] Read [API_DOCUMENTATION.md](API_DOCUMENTATION.md) for all endpoints
- [ ] Create connectors for your use cases
- [ ] Test via Postman/API client
- [ ] Review statistics and logging
- [ ] Try different AI providers

### Medium Term (This Month)

- [ ] Deploy to production (see [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md))
- [ ] Set up monitoring and alerts
- [ ] Configure backups
- [ ] Add authentication (if needed)
- [ ] Integrate into your applications

### Long Term

- [ ] Add more providers (Groq, etc.)
- [ ] Build custom providers
- [ ] Implement webhooks
- [ ] Add rate limiting
- [ ] Scale horizontally

---

## 🎓 Learning Path

### 1. Understand the Basics (30 min)

- [x] Run locally or with Docker
- [x] View dashboard
- [x] Create a connector
- [x] Test a connector
- [ ] Read [README.md](README.md) overview section

### 2. Learn the API (1 hour)

- [ ] Read [API_DOCUMENTATION.md](API_DOCUMENTATION.md)
- [ ] Test endpoints with cURL
- [ ] Import Postman collection: POSTMAN_COLLECTION.json
- [ ] Try POST /api/admin/connectors endpoint

### 3. Set Up Properly (1 hour)

- [ ] Read relevant setup guide:
  - Local: [SETUP_AND_RUN.md](SETUP_AND_RUN.md)
  - Docker: [DOCKER_GUIDE.md](DOCKER_GUIDE.md)
  - Frontend: [FRONTEND_SETUP.md](FRONTEND_SETUP.md)
- [ ] Understand database schema
- [ ] Configure all API keys
- [ ] Set up environment properly

### 4. Deploy to Production (2 hours)

- [ ] Read [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)
- [ ] Choose hosting (Railway/Render/VPS)
- [ ] Set up production database
- [ ] Deploy backend and frontend
- [ ] Verify production endpoints

### 5. Troubleshoot Issues (As Needed)

- [ ] Read [TROUBLESHOOTING.md](TROUBLESHOOTING.md)
- [ ] Check logs
- [ ] Debug with cURL
- [ ] Access database directly if needed

---

## 🆘 Getting Help

### Quick Diagnostics

```bash
# Is backend running?
curl http://localhost:5000/health

# Is database connected?
curl http://localhost:5000/api/db-test

# Are demo connectors loaded?
curl http://localhost:5000/api/admin/connectors | jq '.data | length'

# Check logs
# Terminal 1 (backend): See output directly
# Terminal 2 (frontend): See output directly
# Browser: Press F12, check Console tab
```

### Common Issues & Fixes

**"Backend won't start"**
→ Check PostgreSQL is running
→ Verify DATABASE_URL is correct
→ See [TROUBLESHOOTING.md](TROUBLESHOOTING.md)

**"Can't connect to database"**
→ Start PostgreSQL service
→ Run `npm run migrate`
→ Check credentials in .env

**"Frontend won't load"**
→ Check backend is running
→ Verify VITE_API_URL
→ Open browser DevTools (F12) for errors

**"API calls return 404"**
→ Backend not running
→ Wrong endpoint URL
→ Connector doesn't exist

**"Import errors in code"**
→ Run `npm install` in backend or frontend
→ Clear node_modules: `rm -rf node_modules && npm install`
→ Check Node.js version: `node --version`

### Where to Find Help

| Issue | Resource |
|-------|----------|
| Setup problems | [SETUP_AND_RUN.md](SETUP_AND_RUN.md) |
| Docker issues | [DOCKER_GUIDE.md](DOCKER_GUIDE.md) |
| API questions | [API_DOCUMENTATION.md](API_DOCUMENTATION.md) |
| Errors/bugs | [TROUBLESHOOTING.md](TROUBLESHOOTING.md) |
| Deployment | [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) |
| Frontend dev | [FRONTEND_SETUP.md](FRONTEND_SETUP.md) |

---

## 💡 Pro Tips

### Development

1. **Use Postman** - Import POSTMAN_COLLECTION.json to test all endpoints
2. **Read logs carefully** - They usually tell you exactly what's wrong
3. **Use cURL** - Quick way to test backend without frontend
4. **Keep terminals open** - Leave backend and frontend running side-by-side
5. **Git commit often** - Don't lose your work

### Production

1. **Use Docker** - Makes deployment consistent and repeatable
2. **Set strong passwords** - Use 32+ character random strings
3. **Backup database** - Weekly automatic backups minimum
4. **Monitor costs** - Track AI provider usage and costs
5. **Use secrets manager** - Don't store secrets in code/git

### Security

1. Never commit `.env` files
2. Never log sensitive data
3. Always use HTTPS in production
4. Validate all user input
5. Use environment variables for secrets

---

## 🎯 Success Checklist

Use this to verify everything is working:

- [ ] Backend running on port 5000
- [ ] Frontend running on port 3173 (or 3000 for Docker)
- [ ] Database connected successfully
- [ ] 4 demo connectors loaded
- [ ] Dashboard showing overview
- [ ] Can create a new connector
- [ ] Can test a connector
- [ ] Can view statistics
- [ ] API health check returns 200
- [ ] Frontend loads without errors

If all ✅, you're ready to use the API Hub!

---

## 🚀 You're Ready!

You have a production-ready AI API management platform. Now you can:

✅ Create AI connectors without code
✅ Manage multiple AI providers
✅ Track usage and costs
✅ Deploy to production
✅ Scale to thousands of users

**Next: Deploy it to production or customize it for your needs!**

---

## 📞 Emergency Support

**Backend completely broken?**
```bash
# Reset everything
docker-compose down -v
docker-compose up  # Rebuilds from scratch
```

**Database corrupted?**
```bash
# Backup current state
pg_dump $DATABASE_URL > backup.sql

# Reset database
npm run migrate
npm run seed
```

**Frontend not loading?**
```bash
# Clear cache
cd frontend
rm -rf node_modules dist .vite
npm install
npm run dev
```

---

**Congratulations! You're now running the Universal AI API Connector & Hub.** 🎉

**Start building amazing AI integrations!**

---

### Quick Reference

| What | Where | Command |
|------|-------|---------|
| Run locally | Terminal | `npm run dev` (both) |
| Run with Docker | Terminal | `docker-compose up` |
| Test backend | Browser/cURL | `curl http://localhost:5000/health` |
| Open frontend | Browser | `http://localhost:5173` |
| Create connector | Frontend | Connectors → New Connector |
| Test connector | Frontend | Connectors → [Name] → Test |
| View API docs | Frontend/URL | `http://localhost:5000/api/docs` |
| Access database | Terminal | `psql $DATABASE_URL` |
| Check logs | Terminal | Visible in running terminal |

---

Need more details? Read the specific documentation files for your task:
- 🚀 [Deployment](DEPLOYMENT_GUIDE.md)
- 🐳 [Docker](DOCKER_GUIDE.md)
- 📡 [API Reference](API_DOCUMENTATION.md)
- 🔧 [Troubleshooting](TROUBLESHOOTING.md)

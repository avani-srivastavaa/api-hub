# 🚀 Phase 1: Setup and Run Instructions

Complete project structure has been created. Follow these steps to run it on your machine.

---

## ✅ Step 1: Verify Project Structure

After downloading/cloning, you should have:

```
api-hub/
├── README.md
├── .gitignore
├── backend/
│   ├── package.json
│   ├── .env
│   ├── .env.example
│   ├── nodemon.json
│   ├── src/
│   │   ├── server.js
│   │   ├── config/
│   │   │   └── database.js
│   │   ├── providers/
│   │   │   ├── BaseProvider.js
│   │   │   ├── AnthropicProvider.js
│   │   │   ├── OpenAIProvider.js
│   │   │   ├── GeminiProvider.js
│   │   │   └── index.js
│   │   └── migrations/
│   │       └── init.js
│   └── package.json
```

---

## ✅ Step 2: Install Dependencies

```bash
cd api-hub/backend

# Install npm packages
npm install

# Verify installation
npm list express pg dotenv
```

**Expected output** (versions may vary):
```
api-hub-backend@1.0.0
├── express@4.18.2
├── pg@8.11.0
├── dotenv@16.3.1
└── ... (other packages)
```

---

## ✅ Step 3: Set Up PostgreSQL Database

### Option A: Local PostgreSQL (Recommended for Development)

#### macOS (using Homebrew)
```bash
# Install PostgreSQL
brew install postgresql@15

# Start PostgreSQL service
brew services start postgresql@15

# Connect to PostgreSQL
psql -U postgres

# In psql shell:
CREATE DATABASE api_hub_db;
\q
```

#### Linux (Ubuntu/Debian)
```bash
# Install PostgreSQL
sudo apt-get install postgresql postgresql-contrib

# Start service
sudo systemctl start postgresql

# Connect
sudo -u postgres psql

# In psql shell:
CREATE DATABASE api_hub_db;
\q
```

#### Windows
1. Download from https://www.postgresql.org/download/windows/
2. Run installer, use password: `postgres`
3. Open pgAdmin (comes with installer)
4. Create new database: `api_hub_db`

### Option B: Using Railway (Cloud - Recommended for Production)

```bash
# 1. Sign up at railway.app
# 2. Create new project
# 3. Add PostgreSQL plugin
# 4. Copy DATABASE_URL from settings
# 5. Add to .env:
#    DATABASE_URL=postgresql://user:pass@host:port/db
```

---

## ✅ Step 4: Configure Environment Variables

**backend/.env** is already created, but you need to update it:

```bash
cd backend

# Edit .env file
nano .env
# or
code .env
```

### Update these values:

```env
# Database (if using local PostgreSQL)
DB_HOST=localhost
DB_PORT=5432
DB_NAME=api_hub_db
DB_USER=postgres
DB_PASSWORD=postgres

# Or if using Railway, set:
# DATABASE_URL=postgresql://user:password@host:port/database

# AI Provider API Keys - GET THESE:
ANTHROPIC_API_KEY=sk-ant-YOUR-ACTUAL-KEY-HERE
OPENAI_API_KEY=sk-YOUR-ACTUAL-KEY-HERE
GEMINI_API_KEY=YOUR-ACTUAL-KEY-HERE
```

### Get Your API Keys (Free Tiers Available):

1. **Anthropic Claude**
   - Go to: https://console.anthropic.com/
   - Sign up, get API key
   - $5 free trial credits

2. **OpenAI**
   - Go to: https://platform.openai.com/api-keys
   - Sign up, add payment method
   - $5 free trial

3. **Google Gemini**
   - Go to: https://makersuite.google.com/app/apikey
   - Create new API key
   - Free tier available

---

## ✅ Step 5: Initialize Database Schema

```bash
cd backend

# Run migrations to create tables
npm run migrate
```

**Expected output:**
```
✅ Database schema initialized successfully
📋 Tables created:
   - connectors
   - request_logs
   - provider_keys
📊 Views created:
   - connector_stats
🔍 Indexes created for performance
```

If you get "FATAL: database does not exist", verify:
1. PostgreSQL is running: `brew services list` (macOS)
2. Database exists: `psql -l` (look for api_hub_db)
3. Create if missing: `createdb -U postgres api_hub_db`

---

## ✅ Step 6: Start Development Server

```bash
cd backend

# Start with auto-reload (development)
npm run dev

# OR start normally (production)
npm start
```

**Expected output:**
```
╔════════════════════════════════════════════════════════╗
║     🚀 Universal AI API Hub Backend Started 🚀         ║
╚════════════════════════════════════════════════════════╝

📍 Server running on:  http://localhost:5000
🌍 Environment:        development

📊 Available endpoints:
   • Health check:     http://localhost:5000/health
   • DB Test:          http://localhost:5000/api/db-test
   • System Info:      http://localhost:5000/api/system
   • Connectors:       http://localhost:5000/api/admin/connectors
   • Statistics:       http://localhost:5000/api/stats

💡 Providers available: anthropic, openai, gemini

⏳ Waiting for requests...
```

---

## ✅ Step 7: Test the Backend

In a NEW terminal (keep server running):

```bash
# Test health check
curl http://localhost:5000/health

# Test database connection
curl http://localhost:5000/api/db-test

# Test system information
curl http://localhost:5000/api/system

# List connectors (should be empty)
curl http://localhost:5000/api/admin/connectors
```

**Expected responses:**

```bash
# /health
{"status":"ok","service":"API Hub Backend","version":"1.0.0","timestamp":"..."}

# /api/db-test
{"status":"connected","database":{"timestamp":"...","database":"PostgreSQL 14.5..."},"environment":"development"}

# /api/system
{"status":"ok","service":{...},"providers":{"available":["anthropic","openai","gemini"],"count":3},...}

# /api/admin/connectors
{"success":true,"data":[],"count":0}
```

---

## 🐛 Troubleshooting

### "npm ERR! ERESOLVE unable to resolve dependency tree"
```bash
# Try with legacy peer deps
npm install --legacy-peer-deps
```

### "connect ECONNREFUSED 127.0.0.1:5432"
Database connection failed. Check:
```bash
# Verify PostgreSQL running
psql -U postgres -c "SELECT NOW();"

# If error, start PostgreSQL:
brew services start postgresql@15  # macOS
sudo systemctl start postgresql    # Linux
```

### "database does not exist"
```bash
# Create database
createdb -U postgres api_hub_db

# Then run migration
npm run migrate
```

### "API key is invalid/expired"
- Double-check API keys in .env
- Get fresh keys from provider websites
- Never commit .env file to GitHub

### Port 5000 already in use
```bash
# Find process using port 5000
lsof -i :5000

# Kill it or use different port
PORT=5001 npm run dev
```

### Provider import errors
Make sure all files exist in src/providers/:
- BaseProvider.js
- AnthropicProvider.js
- OpenAIProvider.js
- GeminiProvider.js
- index.js

---

## 📊 Next Steps

Once backend is running and tests pass:

1. **Commit to Git**
   ```bash
   cd /path/to/api-hub
   git add .
   git commit -m "Phase 1: Backend setup with provider abstraction"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/api-hub.git
   git push -u origin main
   ```

2. **Deploy to Railway**
   - Go to railway.app
   - Connect GitHub repository
   - Add environment variables
   - Deploy!

3. **Next Phase (Phase 2)**
   - Implement CRUD endpoints for connectors
   - Build React admin panel
   - Create dynamic input system

---

## ✅ Phase 1 Completion Checklist

- [ ] Project structure created
- [ ] npm dependencies installed
- [ ] PostgreSQL database set up and running
- [ ] .env file configured with real API keys
- [ ] Database migrations ran successfully
- [ ] `npm run dev` starts server without errors
- [ ] `/health` endpoint responds
- [ ] `/api/db-test` endpoint responds
- [ ] `/api/system` shows providers
- [ ] `/api/admin/connectors` returns empty array
- [ ] Pushed to GitHub repository
- [ ] Deployed to Railway (optional)

---

## 📞 Quick Reference

```bash
# Start development server
npm run dev

# Initialize database
npm run migrate

# Check server status
curl http://localhost:5000/health

# View logs in server terminal
# (Already displayed when running npm run dev)

# Stop server
# Press Ctrl+C in terminal
```

---

**Phase 1 is now ready for testing!** 🚀

Next: Phase 2 - Building CRUD endpoints and Admin Panel

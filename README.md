# Universal AI API Connector & API Hub

A production-grade platform for creating, managing, and deploying reusable AI API connectors across multiple providers.

## 🎯 Project Overview

Build a central AI API Hub that allows administrators to:
- Create reusable AI-powered API endpoints without writing code
- Configure inputs, outputs, and instructions for each connector
- Support multiple AI providers (OpenAI, Anthropic, Gemini, Groq)
- Auto-generate API documentation
- Track usage statistics and token consumption
- Test connectors in real-time

## ✨ Key Features

- ✅ Multi-provider AI integration (OpenAI, Anthropic, Gemini, Groq)
- ✅ Dynamic connector configuration (no coding needed)
- ✅ Auto-generated REST API endpoints
- ✅ Auto-generated API documentation
- ✅ Built-in testing interface
- ✅ Usage statistics and logging
- ✅ Token tracking and cost estimation
- ✅ Secure API key management (backend-only)
- ✅ Image/File input support
- ✅ Structured JSON output validation
- ✅ Responsive web interface (desktop & mobile)

## 🏗️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Backend** | Node.js + Express |
| **Database** | PostgreSQL |
| **Frontend** | React + TypeScript + TailwindCSS |
| **Deployment** | Railway / Render |
| **AI Providers** | OpenAI, Anthropic, Google Gemini, Groq |

## 📋 Project Status

### Phase 1: ✅ Backend Architecture & Setup (In Progress)
- [x] Project initialization
- [x] Database schema
- [x] Provider abstraction layer
- [x] Express server setup
- [ ] Live deployment

### Phase 2: ⏳ Admin Interface & CRUD (Next)
- [ ] Connector CRUD endpoints
- [ ] Input parameter system
- [ ] React admin panel

### Phase 3-10: ⏳ Feature Development
- [ ] Output schema validation
- [ ] API endpoint generation
- [ ] Auto-documentation
- [ ] Testing interface
- [ ] Statistics dashboard
- [ ] Deployment & hardening

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL 12+ (or Railway PostgreSQL)
- AI Provider API keys (Anthropic, OpenAI, etc.)

### Installation

```bash
# Clone and setup
git clone <repo>
cd api-hub/backend

# Install dependencies
npm install

# Setup environment
cp .env.example .env
# Edit .env with your API keys

# Initialize database
npm run migrate

# Start development server
npm run dev
```

Server runs on `http://localhost:5000`

## 📖 API Endpoints (To Be Implemented)

### Admin Endpoints
- `POST /api/admin/connectors` - Create new connector
- `GET /api/admin/connectors` - List all connectors
- `GET /api/admin/connectors/:id` - Get connector details
- `PUT /api/admin/connectors/:id` - Update connector
- `DELETE /api/admin/connectors/:id` - Delete connector
- `POST /api/admin/connectors/:id/test` - Test connector
- `GET /api/admin/stats` - Get usage statistics

### Dynamic API Endpoints
- `POST /api/connectors/:endpoint` - Call generated connector

### Documentation
- `GET /api/docs/:connector-id` - Auto-generated documentation

## 🔐 Security

- ✅ API keys stored encrypted on backend only
- ✅ Never exposed in frontend or documentation
- ✅ Request validation and sanitization
- ✅ Rate limiting (planned)
- ✅ API key authentication for endpoints

## 📊 Demo Connectors

### 1. Card Scanner
- **Input**: Business card image
- **Process**: AI vision analysis
- **Output**: Structured JSON with name, company, email, phone

### 2. Article Writer
- **Input**: Topic and parameters
- **Process**: AI text generation
- **Output**: Structured JSON with article sections

## 🛠️ Development

### Project Structure
```
api-hub/
├── backend/
│   ├── src/
│   │   ├── config/          # Configuration files
│   │   ├── models/          # Database models
│   │   ├── providers/       # AI provider implementations
│   │   ├── routes/          # API routes
│   │   ├── middleware/      # Express middleware
│   │   ├── utils/           # Utility functions
│   │   └── server.js        # Main server file
│   ├── package.json
│   └── .env.example
├── frontend/                # React app (coming soon)
└── README.md
```

### Available Scripts

```bash
npm run dev      # Start development server with auto-reload
npm run start    # Start production server
npm run migrate  # Initialize database schema
npm test         # Run tests (coming soon)
```

## 📝 Implementation Phases

See `PRJ-08-PROJECT-PLAN.md` for detailed 12-week breakdown.

## 🤝 Contributing

This is a learning project. Follow the phase breakdown and commit regularly.

## 📞 Support

- See `QUICK-START.md` for setup help
- See `PHASE-1-BACKEND-SETUP.md` for detailed implementation guide
- Check GitHub issues for common problems

## 📄 License

Private project for educational purposes.

---

**Building production-grade AI infrastructure, one connector at a time.** 🚀

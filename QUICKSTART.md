# Sturgeon AI - Quick Start Guide

**Status:** ✅ **BUILD NOW WORKING!** Frontend and backend are both functional.

---

## 🚀 Quick Start (5 minutes)

### Prerequisites
- Node.js 18+ installed
- Python 3.11+ installed
- Git installed

### 1. Clone & Install
```bash
git clone https://github.com/Haroldtrapier/sturgeon-ai-prod.git
cd sturgeon-ai-prod

# Install frontend dependencies
npm install

# Install backend dependencies
pip install -r requirements.txt
```

### 2. Configure Environment
```bash
# Copy the example environment file
cp .env.example .env.local

# Edit .env.local and add your API keys:
# - OPENAI_API_KEY (or ANTHROPIC_API_KEY)
# - SAM_GOV_API_KEY (optional, for contract search)
```

### 3. Run Development Server
```bash
# Start Next.js development server (includes frontend + API routes)
npm run dev

# Open http://localhost:3000
```

---

## ✅ What's Now Working

### Frontend (Next.js/React)
- ✅ **Builds successfully** (`npm run build`)
- ✅ **Linting passes** (`npm run lint`)
- ✅ **Type checking passes** (`npm run type-check`)
- ✅ Home page at `/`
- ✅ Chat interface at `/chat`
- ✅ AI Chat API at `/api/chat` (supports Claude + OpenAI)
- ✅ Tailwind CSS configured and working
- ✅ TypeScript fully configured

### Backend (Python/FastAPI)
- ✅ **All dependencies installed**
- ✅ **FastAPI app imports successfully**
- ✅ Available endpoints:
  - `GET /` - API info
  - `GET /health` - Health check
  - `GET /api/opportunities/search` - SAM.gov contracts
  - `GET /api/grants/search` - Grants.gov search
  - `POST /api/ai/analyze-contract` - Contract analysis
  - `POST /api/ai/generate-proposal` - Proposal generation
  - `POST /api/ai/match-opportunities` - Opportunity matching
  - `POST /api/documents/upload` - File uploads
  - `GET /api/analytics/dashboard` - Dashboard metrics

---

## 🎯 Architecture

### Hybrid Backend Approach (Current)
```
┌─────────────────────────────────────────┐
│         Next.js Application             │
│  (Frontend + Node.js API Routes)        │
├─────────────────────────────────────────┤
│ Pages:                                  │
│   / (home)                              │
│   /chat (AI chat interface)             │
│                                         │
│ API Routes (Node.js):                   │
│   /api/chat → Claude/OpenAI AI chat     │
│   /api/index → Basic API info           │
└─────────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────┐
│    Python FastAPI Backend (index.py)    │
│       (Serverless via Vercel)           │
├─────────────────────────────────────────┤
│ Endpoints:                              │
│   /api/opportunities/* (SAM.gov)        │
│   /api/grants/* (Grants.gov)            │
│   /api/ai/* (AI operations)             │
│   /api/documents/* (File handling)      │
│   /api/analytics/* (Analytics)          │
└─────────────────────────────────────────┘
```

### Key Design Decisions:
1. **AI Chat** → Node.js API route (fast, TypeScript)
2. **Data APIs** → Python FastAPI (SAM.gov, Grants.gov integrations)
3. **Frontend** → Next.js React (SSR + static generation)

---

## 📦 Dependencies Status

### Frontend (npm)
```json
✅ next: 14.0.0
✅ react: 18.2.0
✅ typescript: 5.3.2
✅ tailwindcss: 3.3.5
✅ @anthropic-ai/sdk: Latest (for Claude)
✅ openai: Latest (for GPT)
✅ axios: 1.6.0
✅ @heroicons/react: 2.0.18
✅ All other dependencies installed
```

### Backend (pip)
```
✅ fastapi
✅ uvicorn
✅ mangum (Vercel serverless adapter)
✅ pydantic
✅ httpx
✅ python-dotenv
✅ python-multipart
```

---

## 🔧 Available Commands

```bash
# Development
npm run dev           # Start dev server (http://localhost:3000)
npm run build         # Build for production
npm run start         # Start production server
npm run lint          # Run ESLint
npm run type-check    # Run TypeScript type checker

# Testing (when tests are added)
npm run test          # Run Jest tests
pytest tests/         # Run Python tests
```

---

## 🌐 Vercel Deployment

### Current Status:
- ✅ `vercel.json` configured
- ✅ Next.js builds successfully
- ✅ Python backend compatible with Vercel serverless
- ✅ Ready for deployment

### Deploy to Vercel:
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Deploy to production
vercel --prod
```

### Required Vercel Environment Variables:
Go to your Vercel project settings and add:
```
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
SAM_GOV_API_KEY=your_key
DATABASE_URL=postgresql://...
```

---

## 📱 Testing the Application

### 1. Test Home Page
```bash
npm run dev
# Open http://localhost:3000
# Should see: "✅ Sturgeon AI is Live!"
```

### 2. Test AI Chat
```bash
# Make sure you have API keys in .env.local
# Open http://localhost:3000/chat
# Type a message and send
# Should get AI response
```

### 3. Test Python Backend
```bash
# Start the backend
uvicorn index:app --reload

# Test health endpoint
curl http://localhost:8000/health

# Test opportunities search (requires SAM_GOV_API_KEY)
curl "http://localhost:8000/api/opportunities/search?keywords=software"
```

---

## 🐛 Troubleshooting

### Build Fails
```bash
# Clear Next.js cache
rm -rf .next

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Rebuild
npm run build
```

### AI Chat Not Working
- Check that `OPENAI_API_KEY` or `ANTHROPIC_API_KEY` is set in `.env.local`
- Check browser console for errors
- Verify API route at `/api/chat` is accessible

### Python Backend Issues
```bash
# Reinstall Python dependencies
pip install --upgrade -r requirements.txt

# Test import
python3 -c "import index; print('OK')"
```

---

## 📚 Next Steps

Refer to `BUILD_STATUS.md` for a complete list of:
- ✅ What's built
- ⚠️ What needs work
- 📋 Feature roadmap

### Priority Items:
1. ✅ ~~Fix build errors~~ (DONE!)
2. ✅ ~~Add missing dependencies~~ (DONE!)
3. ✅ ~~Configure Tailwind~~ (DONE!)
4. ⚠️ Set up database (Supabase)
5. ⚠️ Fix database schema syntax errors
6. ⚠️ Implement real AI analysis features
7. ⚠️ Add authentication
8. ⚠️ Add tests

---

## 🔐 Security Notes

- ❌ **Never commit `.env.local` or `.env` to git**
- ✅ Use `.env.example` as a template
- ✅ Store production secrets in Vercel dashboard
- ✅ Rotate API keys regularly
- ⚠️ Add rate limiting before public deployment

---

## 📞 Support

- **Documentation:** See `BUILD_STATUS.md` for complete analysis
- **Setup Guide:** See `SETUP_COMPLETE.md` for deployment info
- **Database:** See `SUPABASE_SETUP_GUIDE.md` for DB setup

---

**Last Updated:** December 4, 2025  
**Build Status:** ✅ WORKING  
**Deployment Ready:** ⚠️ After environment variables configured

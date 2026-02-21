# Harpoon AI – Government Contracting Intelligence & Proposal Platform

**Production-Ready GovCon SaaS**  
**FedRAMP Moderate–Aligned | NIST 800-53 Implemented | Agency Pilot Ready**

---

## What is Harpoon AI?

Harpoon AI is an end-to-end government contracting intelligence and proposal production system that delivers:

- **Requirement Traceability** – Automated SHALL/MUST extraction from RFPs
- **Compliance Confidence** – Real-time compliance matrix with coverage tracking
- **Faster, Auditable Submissions** – One-click submission packages (DOCX/ZIP)
- **FedRAMP-Aligned Security** – RBAC, audit logging, RLS, MFA, encryption

---

## Tech Stack

### Frontend (Vercel):
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Supabase Auth

### Backend (Railway):
- FastAPI (Python)
- Supabase (PostgreSQL + Auth)
- OpenAI GPT-4 / Anthropic Claude
- Stripe (billing)

### Infrastructure:
- **Hosting:** Vercel (frontend), Railway (backend)
- **Database:** Supabase (managed PostgreSQL)
- **Auth:** Supabase Auth (email + MFA)
- **Payments:** Stripe
- **Email:** Resend (alerts, digests)

---

## Railway Deployment (Backend)

### Prerequisites
- Railway account ([railway.app](https://railway.app))
- GitHub repository connected to Railway
- Environment variables configured

### Quick Start

1. **Connect to Railway:**
   - Go to [railway.app/dashboard](https://railway.app/dashboard)
   - Create a new project or connect existing one
   - Link your GitHub repository

2. **Configure Environment Variables in Railway Dashboard:**
   ```
   OPENAI_API_KEY=sk-your-key
   ANTHROPIC_API_KEY=sk-ant-your-key
   SAM_GOV_API_KEY=your-sam-gov-key
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   CORS_ORIGINS=https://your-frontend.vercel.app
   ENVIRONMENT=production
   ```
   See `env.railway.example` for all available variables.

3. **Deploy:**
   Railway auto-deploys on push to `main`. The Dockerfile builds the FastAPI backend with:
   - Python 3.11
   - All dependencies from `backend/requirements.txt`
   - Health check at `/health`
   - Auto-restart on failure

4. **Verify Deployment:**
   ```bash
   curl https://your-backend.up.railway.app/health
   curl https://your-backend.up.railway.app/docs
   ```

### GitHub Actions Auto-Deploy

The CI/CD pipeline (`.github/workflows/deploy-railway.yml`) automatically deploys to Railway when backend files change on `main`.

**Required GitHub Secrets:**
- `RAILWAY_TOKEN` – Get from [railway.app/account/tokens](https://railway.app/account/tokens)
- `RAILWAY_SERVICE_ID` (optional) – For multi-service projects
- `RAILWAY_DOMAIN` (optional) – For health check verification

### Railway Configuration Files

| File | Purpose |
|------|---------|
| `railway.json` | Railway service configuration (builder, health checks, restart policy) |
| `railway.toml` | Alternative Railway config format |
| `Dockerfile` | Docker build for Railway (Python 3.11, FastAPI) |
| `.railwayignore` | Files excluded from Railway builds |
| `env.railway.example` | Template for Railway environment variables |

---

## Vercel Deployment (Frontend)

1. Connect GitHub repo to Vercel
2. Set environment variables:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   BACKEND_URL=https://your-backend.up.railway.app
   NEXT_PUBLIC_API_URL=https://your-backend.up.railway.app
   ```
3. Deploy (auto-deploys from `main`)

---

## Features

### Multi-Agent System (6 Agents):
1. **General Assistant** – Routing, general queries
2. **Opportunity Finder** – SAM.gov search, opportunity ingestion
3. **Proposal Writer** – AI-powered proposal section generation
4. **Compliance Analyst** – SHALL/MUST requirement extraction
5. **Market Researcher** – Agency trends, NAICS analysis
6. **Submission Specialist** – Packaging, readiness scoring

### Proposal Production:
- Automated requirement extraction (SHALL/MUST)
- AI-generated proposal sections
- Real-time compliance matrix
- Readiness scoring (0-100)
- One-click DOCX/ZIP export
- Submission checklists

### Enterprise Security:
- Role-based access control (Admin, Writer, Reviewer, Viewer)
- Row-level security (RLS) for data isolation
- Immutable audit logging
- MFA enforcement
- Legal hold + data retention (7-year default)
- Encryption in transit and at rest

---

## Repository Structure

```
harpoon-ai/
├── backend/                    # FastAPI backend (deployed to Railway)
│   ├── app.py                  # Main FastAPI application
│   ├── routers/                # API route handlers
│   ├── agents/                 # AI agent implementations
│   ├── services/               # Business logic services
│   ├── models/                 # Data models
│   ├── migrations/             # Database migrations
│   ├── jobs/                   # Background job scheduler
│   └── requirements.txt        # Python dependencies
├── app/                        # Next.js frontend (deployed to Vercel)
│   ├── dashboard/              # Dashboard pages
│   ├── agents/                 # Agent chat UI
│   ├── proposals/              # Proposal builder
│   ├── opportunities/          # Opportunity tracking
│   ├── marketplaces/           # Marketplace integrations
│   └── api/                    # API routes (Next.js)
├── components/                 # Shared React components
├── lib/                        # Shared utilities
├── security/                   # Security documentation
├── .github/workflows/          # CI/CD pipelines
├── Dockerfile                  # Railway Docker build
├── railway.json                # Railway configuration
├── railway.toml                # Railway configuration (TOML)
├── vercel.json                 # Vercel configuration
└── package.json                # Frontend dependencies
```

---

## Pricing

- **Starter:** $99/month
- **Pro:** $399/month
- **Enterprise:** $5k–$25k/year (custom)

See [PRICING.md](./PRICING.md) for details.

---

## Security & Compliance

- **FedRAMP Moderate–aligned** (not certified)
- **NIST 800-53 Rev. 5** controls implemented
- **Audit logging** (immutable)
- **RBAC + RLS** (team isolation)
- **MFA enforced**
- **Encryption** (in transit + at rest)
- **Data retention** (7-year default, legal hold support)

---

## License

Proprietary. All rights reserved.

---

**Built for GovCon. Ready for agencies. Launch-ready.**

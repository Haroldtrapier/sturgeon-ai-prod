# STURGEON AI - UNIFIED ARCHITECTURE
**System Architecture Documentation**

---

## Executive Architecture Overview

Sturgeon AI is a cloud-native, microservices-based government contracting intelligence platform combining:
- **Frontend:** Next.js 14 with React Server Components
- **Backend:** FastAPI with Python 3.11+
- **Database:** PostgreSQL 15 (Supabase)
- **AI:** Anthropic Claude Sonnet 4 (6 specialized agents)
- **Infrastructure:** Vercel (frontend) + Railway (backend)

---

## System Layers

```
┌─────────────────────────────────────────────────────────────┐
│                     PRESENTATION LAYER                       │
│              (Next.js 14 + React + Tailwind)                │
├─────────────────────────────────────────────────────────────┤
│  • Server Components (RSC)                                   │
│  • Client Components (Interactive)                           │
│  • Shadcn UI Components                                      │
│  • Responsive Design (Mobile-first)                          │
└─────────────────────────────────────────────────────────────┘
                              ↕
┌─────────────────────────────────────────────────────────────┐
│                      API GATEWAY LAYER                       │
│                 (Next.js API Routes + Middleware)            │
├─────────────────────────────────────────────────────────────┤
│  • Authentication (Clerk)                                    │
│  • Rate Limiting                                             │
│  • Request Validation                                        │
│  • Error Handling                                            │
│  • Logging & Monitoring                                      │
└─────────────────────────────────────────────────────────────┘
                              ↕
┌─────────────────────────────────────────────────────────────┐
│                   BUSINESS LOGIC LAYER                       │
│                      (FastAPI Backend)                       │
├─────────────────────────────────────────────────────────────┤
│  • RESTful API Endpoints                                     │
│  • Business Rules Engine                                     │
│  • Workflow Orchestration                                    │
│  • Data Validation & Transformation                          │
└─────────────────────────────────────────────────────────────┘
                              ↕
┌─────────────────────────────────────────────────────────────┐
│                      AI AGENT LAYER                          │
│                  (6 Specialized AI Agents)                   │
├─────────────────────────────────────────────────────────────┤
│  🔍 Research Agent     |  ⚖️ Compliance Specialist          │
│  📊 Opportunity Analyst|  ✍️ Proposal Assistant              │
│  📈 Market Intelligence|  💬 General Assistant               │
│                                                              │
│  • Intent Classification & Routing                           │
│  • Context Management                                        │
│  • Streaming Responses                                       │
│  • Cost Tracking                                             │
└─────────────────────────────────────────────────────────────┘
                              ↕
┌─────────────────────────────────────────────────────────────┐
│                       DATA LAYER                             │
│                (PostgreSQL 15 via Supabase)                  │
├─────────────────────────────────────────────────────────────┤
│  • User & Company Data                                       │
│  • Opportunities (500K+ records)                             │
│  • Proposals & Past Performance                              │
│  • Chat Conversations & Messages                             │
│  • Vector Embeddings (for search)                            │
│  • Row-Level Security (RLS)                                  │
└─────────────────────────────────────────────────────────────┘
                              ↕
┌─────────────────────────────────────────────────────────────┐
│                  EXTERNAL INTEGRATIONS                       │
├─────────────────────────────────────────────────────────────┤
│  Government Data:     |  Business Services:                  │
│  • SAM.gov API       |  • Stripe (Payments)                 │
│  • FPDS-NG           |  • Clerk (Auth)                       │
│  • USASpending.gov   |  • Resend (Email)                     │
│  • Grants.gov        |  • Twilio (SMS - optional)            │
│  • Beta.SAM.gov      |  • PostHog (Analytics)                │
└─────────────────────────────────────────────────────────────┘
```

---

## Component Architecture

### 1. Frontend Architecture (Next.js 14)

```
app/
├── (auth)/               # Public authentication pages
│   ├── sign-in/
│   └── sign-up/
├── dashboard/            # Protected dashboard
│   ├── layout.tsx        # Shared layout with sidebar
│   └── [features]/       # Feature modules
├── api/                  # API route handlers
│   ├── opportunities/
│   ├── proposals/
│   ├── agents/
│   └── webhooks/
└── components/           # Reusable UI components
    ├── ui/               # Shadcn primitives
    └── [features]/       # Feature-specific components
```

**Key Patterns:**
- **Server Components (default):** Data fetching, static content
- **Client Components ('use client'):** Interactive UI, state management
- **Server Actions:** Form submissions, mutations
- **Streaming:** Real-time AI responses via ReadableStream

### 2. Backend Architecture (FastAPI)

```
backend/
├── main.py               # FastAPI application entry
├── routers/              # API route modules
│   ├── opportunities.py
│   ├── proposals.py
│   ├── sam.py
│   └── agent.py
├── services/             # Business logic
│   ├── sam_gov.py        # SAM.gov integration
│   ├── agent_kit.py      # AI agent orchestration
│   └── analytics.py
├── models/               # Database models (SQLAlchemy)
├── database.py           # Database connection
└── config.py             # Configuration management
```

**Key Patterns:**
- **Router-based organization:** Logical separation by domain
- **Dependency injection:** FastAPI's `Depends()` for auth, DB
- **Async/await:** Non-blocking I/O for external APIs
- **Pydantic models:** Request/response validation

### 3. AI Agent Architecture

```
┌─────────────────────────────────────────────────────┐
│              USER MESSAGE                            │
└───────────────────┬─────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────┐
│         INTENT CLASSIFICATION                        │
│  (GPT-4 or rules-based routing)                     │
└───────────────────┬─────────────────────────────────┘
                    │
          ┌─────────┼─────────┐
          │         │         │
          ▼         ▼         ▼
    ┌─────────┐ ┌──────┐ ┌─────────┐
    │Research │ │Opport│ │Proposal │
    │ Agent   │ │Analyst│ │Assistant│
    └─────────┘ └──────┘ └─────────┘
          │         │         │
          └─────────┼─────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────┐
│         CONTEXT ENRICHMENT                           │
│  • User profile                                      │
│  • Company certifications                            │
│  • Past conversations                                │
│  • Relevant documents                                │
└───────────────────┬─────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────┐
│      ANTHROPIC CLAUDE SONNET 4 API                   │
│  (Streaming response)                                │
└───────────────────┬─────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────┐
│         RESPONSE PROCESSING                          │
│  • Format as markdown                                │
│  • Extract actions (track opp, create proposal)      │
│  • Log conversation                                  │
│  • Update usage metrics                              │
└───────────────────┬─────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────┐
│       STREAM TO USER (Server-Sent Events)           │
└─────────────────────────────────────────────────────┘
```

**Agent Specializations:**
1. **Research Agent:** SAM.gov/FPDS queries, data extraction
2. **Opportunity Analyst:** GO/NO-GO scoring, competition analysis
3. **Compliance Specialist:** FAR/DFARS references, certification guidance
4. **Proposal Assistant:** Draft technical/management volumes
5. **Market Intelligence:** Spending trends, forecasting
6. **General Assistant:** Orchestration, general questions

---

## Data Flow Diagrams

### Opportunity Search Flow
```
[User] → [Search Input]
         ↓
[Frontend] → POST /api/opportunities/search
         ↓
[API Gateway] → Validate + Auth
         ↓
[Backend] → SAM.gov API
         ↓
[SAM.gov] returns 500K+ opportunities
         ↓
[Backend] → Filter + Score (ContractMatch)
         ↓
[Database] → Cache results
         ↓
[Frontend] ← JSON response
         ↓
[User] ← Rendered results (cards/table)
```

### AI Chat Flow
```
[User] → "Find DoD cybersecurity opportunities"
         ↓
[Frontend] → POST /api/agents/chat
         ↓
[API Gateway] → Auth + Rate limit
         ↓
[AI Agent Layer] → Classify intent → Research Agent
         ↓
[Research Agent] → Build system prompt with context
         ↓
[Anthropic API] → Claude Sonnet 4 (streaming)
         ↓
[AI Agent Layer] ← Stream response tokens
         ↓
[Frontend] ← Server-Sent Events (SSE)
         ↓
[User] ← Real-time streaming text
```

### Proposal Generation Flow
```
[User] → Select opportunity + Click "Start Proposal"
         ↓
[Frontend] → POST /api/proposals with opportunity_id
         ↓
[Backend] → Fetch opportunity details
         ↓
[Backend] → Fetch company profile, past performance
         ↓
[AI Agent Layer] → Proposal Assistant agent
         ↓
[Anthropic API] → Generate:
         • Executive summary (3 win themes)
         • Technical approach
         • Management plan
         • Past performance narrative
         ↓
[Database] → Save proposal sections
         ↓
[Frontend] ← Proposal ID + sections
         ↓
[User] → Edit in rich text editor
```

---

## Database Architecture

### Entity Relationship Diagram
```
users ──────┬──────< companies
            │
            ├──────< tracked_opportunities
            │
            ├──────< proposals
            │
            ├──────< conversations
            │             │
            │             └──────< messages
            │
            └──────< subscriptions ──────> plans

companies ──┬──────< company_naics ──────> naics_codes
            │
            ├──────< certifications
            │
            ├──────< past_performance
            │
            ├──────< personnel
            │
            └──────< team_members ──────> users

opportunities ──────< tracked_opportunities
              └──────< proposals
```

### Key Tables

**users** (Authentication)
- Stores Clerk user data
- Links to companies (ownership)

**companies** (Organizations)
- Legal business information
- SAM.gov registration (UEI, CAGE)
- Revenue, employees

**opportunities** (SAM.gov Data)
- 500K+ federal opportunities
- Indexed by NAICS, agency, deadline

**proposals** (User Content)
- Linked to opportunities
- Status workflow (draft → submitted → won/lost)

**conversations & messages** (AI Chat)
- Multi-turn chat history
- Agent type tracking
- Token usage

---

## Security Architecture

### Authentication Flow (Clerk)
```
[User] → Sign up/Login
         ↓
[Clerk] → Verify credentials
         ↓
[Clerk] → Issue JWT token
         ↓
[Frontend] → Store in httpOnly cookie
         ↓
[Every API Request] → Include JWT in header
         ↓
[Middleware] → Verify JWT signature
         ↓
[Middleware] → Extract user_id
         ↓
[API Handler] → Fetch user data
```

### Authorization (RBAC)
```typescript
Role Hierarchy:
  Admin > Manager > User > Viewer

Permissions:
  Admin:   Full access (including billing, team mgmt)
  Manager: Read/write opportunities, proposals, team view
  User:    Read/write opportunities, proposals
  Viewer:  Read-only access
```

### Data Security
- **Encryption at rest:** PostgreSQL (Supabase)
- **Encryption in transit:** TLS 1.3
- **Row-Level Security (RLS):** Users can only access their company's data
- **API keys:** Stored in environment variables (never committed)
- **PII protection:** GDPR-compliant data handling

---

## Deployment Architecture

### Production Infrastructure
```
┌─────────────────────────────────────────────────────┐
│                    VERCEL                            │
│                  (Frontend Hosting)                  │
├─────────────────────────────────────────────────────┤
│  • Next.js SSR/SSG                                   │
│  • Edge Functions (Middleware)                       │
│  • CDN (Global distribution)                         │
│  • Automatic HTTPS                                   │
│  • Preview deployments (PR-based)                    │
└─────────────────────────────────────────────────────┘
                    ↕ HTTPS
┌─────────────────────────────────────────────────────┐
│                   RAILWAY                            │
│                  (Backend Hosting)                   │
├─────────────────────────────────────────────────────┤
│  • FastAPI application                               │
│  • Python 3.11 runtime                               │
│  • Auto-scaling (1-10 instances)                     │
│  • Health checks                                     │
│  • Environment variables                             │
└─────────────────────────────────────────────────────┘
                    ↕ PostgreSQL
┌─────────────────────────────────────────────────────┐
│                  SUPABASE                            │
│              (Database + Services)                   │
├─────────────────────────────────────────────────────┤
│  • PostgreSQL 15                                     │
│  • Row-Level Security (RLS)                          │
│  • Real-time subscriptions                           │
│  • Automated backups (daily)                         │
│  • Connection pooling                                │
└─────────────────────────────────────────────────────┘
```

### CI/CD Pipeline
```
[GitHub] → Push to main
         ↓
[GitHub Actions] → Run tests
         ↓
[Tests Pass?] ─No→ [Notify developer]
         │Yes
         ↓
[Vercel] → Build frontend
         ↓
[Railway] → Deploy backend
         ↓
[Smoke Tests] → Health checks
         ↓
[Deployed] ✅
```

---

## Performance Architecture

### Caching Strategy
```
Browser Cache (60s)
         ↓
Vercel Edge Cache (5 min)
         ↓
Application Cache (Redis - planned)
         ↓
Database Query (Supabase)
```

### Optimization Techniques
1. **React Server Components:** Reduce client-side JavaScript
2. **Image Optimization:** Next.js `<Image>` with WebP
3. **Database Indexing:** NAICS, agency, deadline fields
4. **CDN:** Static assets via Vercel Edge
5. **Lazy Loading:** Code splitting for routes
6. **Streaming:** AI responses via Server-Sent Events

---

## Monitoring & Observability

### Logging
```
Application Logs → Vercel Logs
Backend Logs → Railway Logs
Database Logs → Supabase Logs
         ↓
Aggregation (Sentry - planned)
         ↓
Dashboards & Alerts
```

### Metrics Tracked
- API response times (p50, p95, p99)
- Error rates by endpoint
- Database query performance
- AI agent token usage
- User activity (DAU/MAU)
- Subscription conversions

---

## Scalability Plan

### Current Capacity
- **Users:** 1,000 concurrent
- **Opportunities:** 500K+ cached
- **Database:** 100GB (plenty of headroom)
- **API requests:** 10K/minute

### Scaling Strategy
1. **Horizontal scaling:** Add Railway instances
2. **Database:** Supabase auto-scaling + read replicas
3. **Caching:** Introduce Redis for hot data
4. **CDN:** Static assets already on Vercel Edge
5. **Rate limiting:** Protect against abuse

---

## Disaster Recovery

### Backup Strategy
- **Database:** Daily automated backups (Supabase)
- **Retention:** 30-day backup history
- **Point-in-time recovery:** Available

### Incident Response
1. **Detection:** Automated health checks (Vercel + Railway)
2. **Alerting:** Email/SMS to on-call engineer
3. **Triage:** Assess severity and impact
4. **Communication:** Status page updates
5. **Resolution:** Fix + deploy + verify
6. **Postmortem:** Document learnings

---

## Technology Decision Log

### Why Next.js 14?
✅ React Server Components (performance)
✅ App Router (modern routing)
✅ Built-in API routes
✅ Excellent Vercel integration
✅ Active ecosystem

### Why FastAPI?
✅ Async/await (high performance)
✅ Automatic OpenAPI docs
✅ Pydantic validation
✅ Python ecosystem (AI/ML libraries)
✅ Easy to learn and maintain

### Why Supabase?
✅ PostgreSQL (reliable, feature-rich)
✅ Row-Level Security (built-in)
✅ Real-time subscriptions
✅ Generous free tier
✅ Easy migration path to self-hosted

### Why Claude Sonnet 4?
✅ Best-in-class reasoning
✅ Large context window (200K tokens)
✅ Streaming responses
✅ Function calling
✅ Cost-effective ($3/$15 per 1M tokens)

---

## Future Architecture Enhancements

### Short-term (3-6 months)
- Redis caching layer
- WebSocket support (real-time collaboration)
- Background job queue (Celery or BullMQ)
- Enhanced observability (Datadog or New Relic)

### Long-term (6-12 months)
- Microservices split (separate AI service)
- GraphQL API (alternative to REST)
- Mobile apps (React Native)
- Self-hosted option (Docker Compose)
- Multi-region deployment

---

**Document Version:** 2.0  
**Last Updated:** February 04, 2026  
**Status:** ✅ Active

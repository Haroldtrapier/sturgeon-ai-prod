# STURGEON AI - UNIFIED ARCHITECTURE

**Comprehensive System Architecture Across All Repositories**

Last Updated: February 4, 2026

---

## TABLE OF CONTENTS

1. Repository Overview
2. Unified Architecture Diagram
3. Technology Stack Consolidation
4. Data Flow & Integration
5. Deployment Strategy
6. Migration Path (HTML → Production)

---

## 1. REPOSITORY OVERVIEW

### 1.1 sturgeon-ai-prod (PRODUCTION) ⭐
**Purpose:** Full-stack production application  
**Size:** 298 files (1.1 MB)  
**Language:** TypeScript (Next.js 14) + Python (FastAPI)  
**Status:** ✅ Active Development - Most Recent Updates

**Key Components:**
```
sturgeon-ai-prod/
├── app/                          # Next.js 14 App Router
│   ├── api/                      # API routes
│   ├── dashboard/                # User dashboard
│   ├── opportunities/            # Opportunity search
│   ├── proposals/                # Proposal builder
│   ├── chat/                     # AI chat interface
│   └── agents/                   # AI agent pages
├── backend/                      # Python FastAPI services
│   ├── routers/                  # API endpoints
│   ├── services/                 # Business logic
│   ├── models/                   # Data models
│   └── tests/                    # Test suites
├── components/                   # React components
├── lib/                          # Utilities & clients
├── supabase/                     # Database migrations
└── .github/                      # CI/CD & agents
```

**Features Implemented:**
✅ Authentication (Clerk)  
✅ Database (Supabase PostgreSQL)  
✅ AI Chat (6 specialized agents)  
✅ SAM.gov Integration  
✅ Opportunity Import/Search  
✅ Agent-based workflows  
✅ Marketplace integrations  
✅ Profile management  
✅ Deployment configs (Vercel + Railway)

---

### 1.2 sturgeon-ai (HTML PROTOTYPE)
**Purpose:** Design prototype & UI reference  
**Size:** 103 files (41.5 MB)  
**Language:** HTML + CSS + JavaScript  
**Status:** 🔄 Reference for UI/UX Migration

**Key Components:**
```
sturgeon-ai/
├── index.html                    # Landing page
├── pages/                        # 87 HTML pages
│   ├── dashboard/                # 8 dashboard pages
│   ├── opportunities/            # 7 opportunity pages
│   ├── proposals/                # 6 proposal pages
│   ├── compliance/               # 9 compliance pages
│   ├── ai-chat/                  # 6 chat pages
│   ├── certification/            # 8 certification pages
│   ├── research/                 # 5 research pages
│   ├── pro/                      # 5 billing pages
│   └── system/                   # Settings pages
├── css/                          # Stylesheets
├── js/                           # JavaScript
└── docs/                         # Documentation
```

**Features Designed:**
✅ 87+ page wireframes  
✅ Complete UI/UX flows  
✅ Navigation structure  
✅ Component layouts  
✅ User interactions  
✅ Visual design system

---

## 2. UNIFIED ARCHITECTURE DIAGRAM

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER INTERFACE                          │
│  ┌───────────────────────────────────────────────────────┐     │
│  │  STURGEON-AI (HTML Prototype) - Design Reference      │     │
│  │  • 87 HTML pages                                       │     │
│  │  • UI/UX wireframes                                    │     │
│  │  • Visual design system                                │     │
│  └───────────────────────────────────────────────────────┘     │
│                              ↓ Migration ↓                      │
│  ┌───────────────────────────────────────────────────────┐     │
│  │  STURGEON-AI-PROD (Production App) - Next.js 14       │     │
│  │  • React Server Components                             │     │
│  │  • TypeScript                                          │     │
│  │  • Tailwind CSS + Shadcn UI                           │     │
│  │  • Responsive & Accessible                            │     │
│  └───────────────────────────────────────────────────────┘     │
└─────────────────────────────────────────────────────────────────┘
                              ↕
┌─────────────────────────────────────────────────────────────────┐
│                        API LAYER                                 │
│  ┌──────────────────────┬──────────────────────────────────┐   │
│  │  Next.js API Routes  │  Python FastAPI (Backend)        │   │
│  │  • /api/auth         │  • /backend/routers/             │   │
│  │  • /api/opportunities│  • /backend/services/            │   │
│  │  • /api/proposals    │  • /backend/ai_engine.py         │   │
│  │  • /api/agents       │  • /backend/match_engine.py      │   │
│  │  • /api/sam          │  • /backend/govcon_client.py     │   │
│  └──────────────────────┴──────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              ↕
┌─────────────────────────────────────────────────────────────────┐
│                      AI AGENT LAYER                              │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  6 SPECIALIZED AI AGENTS (Claude Sonnet 4)              │  │
│  ├──────────────────────────────────────────────────────────┤  │
│  │  1. Research Agent        → SAM.gov, FPDS, USASpending  │  │
│  │  2. Opportunity Analyst   → GO/NO-GO, Win Probability   │  │
│  │  3. Compliance Specialist → FAR/DFARS, Certifications   │  │
│  │  4. Proposal Assistant    → Technical Writing, Editing  │  │
│  │  5. Market Intelligence   → Trends, Competitors         │  │
│  │  6. General Assistant     → Orchestration, Help         │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              ↕
┌─────────────────────────────────────────────────────────────────┐
│                      DATA & STORAGE LAYER                        │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  SUPABASE (PostgreSQL 15)                                │  │
│  │  • users, companies, certifications                      │  │
│  │  • opportunities, tracked_opportunities                  │  │
│  │  • proposals, proposal_sections                          │  │
│  │  • conversations, messages (AI chat)                     │  │
│  │  • past_performance, personnel                           │  │
│  │  • subscriptions, plans, team_members                    │  │
│  │  • Vector embeddings for semantic search                 │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              ↕
┌─────────────────────────────────────────────────────────────────┐
│                   EXTERNAL INTEGRATIONS                          │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Government Data Sources                                 │  │
│  │  • SAM.gov API (500K+ opportunities)                     │  │
│  │  • FPDS-NG ($500B+ contracts)                            │  │
│  │  • USASpending.gov (spending analytics)                 │  │
│  │  • Grants.gov (federal grants)                           │  │
│  ├──────────────────────────────────────────────────────────┤  │
│  │  SaaS Services                                           │  │
│  │  • Clerk (Authentication)                                │  │
│  │  • Stripe (Payments & Billing)                           │  │
│  │  • Resend (Transactional Email)                          │  │
│  │  • Twilio (SMS Notifications)                            │  │
│  │  • PostHog (Analytics)                                   │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 3. TECHNOLOGY STACK CONSOLIDATION

### Frontend Technologies
| Component | sturgeon-ai (Prototype) | sturgeon-ai-prod (Production) |
|-----------|-------------------------|-------------------------------|
| Framework | Plain HTML | **Next.js 14.2.0** |
| Language | JavaScript | **TypeScript 5.3+** |
| Styling | CSS | **Tailwind CSS 3.4+** |
| Components | Native HTML | **Shadcn UI + Radix UI** |
| Routing | HTML links | **App Router (Next.js)** |
| State | Local JS | **React Server Components** |

### Backend Technologies
| Component | Implementation | Location |
|-----------|----------------|----------|
| API Framework | Next.js API Routes | `app/api/` |
| Python Services | FastAPI | `backend/` |
| AI Integration | Anthropic SDK | `lib/ai/` |
| Database Client | Supabase JS | `lib/db/` |
| Auth | Clerk SDK | `lib/auth/` |

### Shared Technologies
- **Database:** Supabase (PostgreSQL 15) - Both repos
- **AI:** Anthropic Claude Sonnet 4 - Both repos
- **APIs:** SAM.gov, FPDS, USASpending - Both repos
- **Deployment:** Vercel (frontend), Railway (backend) - Prod only

---

## 4. DATA FLOW & INTEGRATION

### 4.1 User Authentication Flow
```
User → Clerk Auth → Next.js Middleware → Supabase RLS → App
```

### 4.2 Opportunity Search Flow
```
User Query → API Route → SAM.gov Client → Parse Results → Supabase Cache → Return to UI
```

### 4.3 AI Chat Flow
```
User Message → Agent Router → Specific Agent → Anthropic API → Stream Response → UI
```

### 4.4 Proposal Generation Flow
```
User Input → Proposal Assistant → Generate Sections → Supabase Storage → Editor UI
```

---

## 5. DEPLOYMENT STRATEGY

### Production Deployment (sturgeon-ai-prod)

**Frontend (Vercel)**
```bash
Domain: app.sturgeonai.com
Framework: Next.js 14
Region: US East (iad1)
Auto-deploy: main branch
Environment: Production
```

**Backend (Railway - Optional)**
```bash
Service: FastAPI backend
Runtime: Python 3.11
Region: US East
Scale: 2 instances
Health Check: /api/health
```

**Database (Supabase)**
```bash
Project: sturgeon-ai-prod
Region: US East
Plan: Pro ($25/mo)
Backups: Daily automated
Connections: Pooler enabled
```

### Prototype (sturgeon-ai) - For Reference Only
```bash
Usage: Design reference, not deployed
Purpose: UI/UX specifications
Migration: Convert HTML → React components
```

---

## 6. MIGRATION PATH (HTML → Production)

### Phase 1: Core Pages ✅
```
✓ Landing page (index.html → app/page.tsx)
✓ Dashboard (pages/dashboard/ → app/dashboard/)
✓ Auth pages (sign-in, sign-up)
✓ Profile pages
```

### Phase 2: Feature Pages 🔄
```
→ Opportunities module (7 pages)
→ Proposals module (6 pages)
→ AI Chat module (6 pages)
→ SAM.gov integration (5 pages)
```

### Phase 3: Advanced Features ⏳
```
⏳ Compliance module (9 pages)
⏳ Certification center (8 pages)
⏳ Market research (5 pages)
⏳ Admin panel (6 pages)
```

### Phase 4: Polish & Launch ⏳
```
⏳ Billing & subscriptions (5 pages)
⏳ Notifications system (3 pages)
⏳ Support center (4 pages)
⏳ Settings pages (4 pages)
```

### Migration Process
For each HTML page:

1. **Analyze** HTML structure in sturgeon-ai
2. **Convert** to React Server Component
3. **Style** with Tailwind CSS
4. **Integrate** with API routes
5. **Connect** to Supabase
6. **Test** functionality
7. **Deploy** to production

---

## SUMMARY

### Current State
- **sturgeon-ai**: Complete UI/UX prototype (87 pages)
- **sturgeon-ai-prod**: Production app with core features
- **Integration**: 40% complete

### Next Steps
1. Complete Phase 2 migrations (Opportunities, Proposals, Chat)
2. Implement remaining AI agents
3. Build out advanced features (Compliance, Certifications)
4. Polish UI/UX for production launch
5. Public beta launch

### Key Benefits of Dual-Repo Approach
✅ **Rapid Prototyping**: HTML allows quick iteration  
✅ **Clear Specifications**: Detailed page designs  
✅ **Parallel Development**: UI and backend progress independently  
✅ **Quality Assurance**: Design reference prevents scope creep  
✅ **Documentation**: Living specification for team

---

**Maintained by:**  
Harold Trapier  
Trapier Management LLC  
Charlotte, NC

**Last Updated:** February 4, 2026
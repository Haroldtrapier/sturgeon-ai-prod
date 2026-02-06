# Sturgeon AI – Government Contracting Intelligence & Proposal Platform

**Production-Ready GovCon SaaS**  
**FedRAMP Moderate–Aligned | NIST 800-53 Implemented | Agency Pilot Ready**

---

## 🎯 What is Sturgeon AI?

Sturgeon AI is an end-to-end government contracting intelligence and proposal production system that delivers:

- **Requirement Traceability** – Automated SHALL/MUST extraction from RFPs
- **Compliance Confidence** – Real-time compliance matrix with coverage tracking
- **Faster, Auditable Submissions** – One-click submission packages (DOCX/ZIP)
- **FedRAMP-Aligned Security** – RBAC, audit logging, RLS, MFA, encryption

**No hype. Outcomes only.**

---

## 🚀 Current Status

- **✅ Core Platform:** Complete (Phases 1–7)
- **✅ Security Pack:** FedRAMP-aligned documentation ready
- **✅ Pricing:** Locked (Starter/Pro/Enterprise)
- **🔶 Launch Status:** Pre-Production (checklist in progress)
- **🎯 Next:** 3 agency pilots, then paid launch

---

## 📚 Documentation

### Core Docs:
- [Production Launch Checklist](./PRODUCTION_LAUNCH_CHECKLIST.md)
- [Agency Pilot Strategy](./PILOT_STRATEGY.md)
- [Pricing & Packaging](./PRICING.md)

### Phase READMEs:
- [Phase 4: Proposal Generator + Compliance Matrix](./README_PHASE4.md)
- [Security Documentation Pack](./security/) (SSP, policies, control matrix)

---

## 🔧 Tech Stack

### Frontend (Vercel):
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Supabase Auth

### Backend (Railway):
- FastAPI (Python)
- Supabase (PostgreSQL + Auth)
- OpenAI GPT-4
- Stripe (billing)

### Infrastructure:
- **Hosting:** Vercel (frontend), Railway (backend)
- **Database:** Supabase (managed PostgreSQL)
- **Auth:** Supabase Auth (email + MFA)
- **Payments:** Stripe
- **Email:** Resend (alerts, digests)

---

## ✨ Features

### 🤖 Multi-Agent System (6 Agents):
1. **General Assistant** – Routing, general queries
2. **Opportunity Finder** – SAM.gov search, opportunity ingestion
3. **Proposal Writer** – AI-powered proposal section generation
4. **Compliance Analyst** – SHALL/MUST requirement extraction
5. **Market Researcher** – Agency trends, NAICS analysis
6. **Submission Specialist** – Packaging, readiness scoring

### 📄 Proposal Production:
- Automated requirement extraction (SHALL/MUST)
- AI-generated proposal sections
- Real-time compliance matrix
- Readiness scoring (0-100)
- One-click DOCX/ZIP export
- Submission checklists

### 🔒 Enterprise Security:
- Role-based access control (Admin, Writer, Reviewer, Viewer)
- Row-level security (RLS) for data isolation
- Immutable audit logging
- MFA enforcement
- Legal hold + data retention (7-year default)
- Encryption in transit and at rest

### 📊 Analytics & Dashboards:
- Opportunity tracking
- Proposal pipeline metrics
- Compliance coverage stats
- User activity logs

---

## 📂 Repository Structure

```
sturgeon-ai-prod/
├── backend/
│   ├── main.py                    # FastAPI app
│   ├── routers/
│   │   ├── chat.py                # Multi-agent chat
│   │   ├── proposals.py            # Proposal CRUD + generation
│   │   ├── submission.py           # Submission packaging
│   │   ├── export.py               # DOCX/ZIP export
│   │   ├── review.py               # Human review workflow
│   │   └── billing.py              # Stripe integration
│   ├── services/
│   │   ├── compliance_extractor.py # SHALL/MUST extraction
│   │   ├── proposal_generator.py   # AI proposal writer
│   │   ├── readiness.py            # Readiness scoring
│   │   ├── packager.py             # ZIP packaging
│   │   └── brief_gen.py            # Submission brief generator
│   ├── migrations/
│   │   ├── 004_proposals_compliance.sql
│   │   ├── 005_review_teams_audit.sql
│   │   └── 006_submission_readiness_security.sql
│   └── templates/
│       ├── proposal.docx
│       └── compliance_matrix.docx
├── frontend/
│   ├── app/
│   │   ├── dashboard/page.tsx
│   │   ├── proposals/[id]/page.tsx  # Proposal builder UI
│   │   └── settings/page.tsx
│   ├── components/
│   └── lib/
├── security/
│   ├── SSP.docx                      # System Security Plan
│   ├── control-matrix.xlsx           # Control Implementation Matrix
│   ├── architecture-diagrams/
│   ├── policies/                      # 6 core policies
│   ├── incident-response/
│   └── conmon-metrics.md
├── PRODUCTION_LAUNCH_CHECKLIST.md
├── PILOT_STRATEGY.md
├── PRICING.md
└── README.md                       # This file
```

---

## 🛠️ Setup & Deployment

### Prerequisites:
- Node.js 18+
- Python 3.11+
- Supabase account
- Railway account
- Vercel account
- OpenAI API key
- Stripe account

### Environment Variables:

**Backend (.env):**
```bash
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
OPENAI_API_KEY=your_openai_key
STRIPE_SECRET_KEY=your_stripe_secret
```

**Frontend (.env.local):**
```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_API_URL=your_railway_backend_url
```

### Deploy:

1. **Database:**
   ```bash
   # Run migrations in Supabase SQL Editor
   backend/migrations/004_proposals_compliance.sql
   backend/migrations/005_review_teams_audit.sql
   backend/migrations/006_submission_readiness_security.sql
   ```

2. **Backend (Railway):**
   - Connect GitHub repo
   - Set environment variables
   - Deploy (auto-deploys from `main`)

3. **Frontend (Vercel):**
   - Connect GitHub repo
   - Set environment variables
   - Deploy (auto-deploys from `main`)

---

## 📊 Roadmap

### ✅ Completed (Phases 1–7):
- Multi-agent chat system
- Opportunity intelligence (SAM.gov ingestion)
- Proposal generator + compliance matrix
- DOCX/ZIP export
- Human review workflow
- Teams + roles + audit logging
- FedRAMP-aligned security pack

### 🔶 Current (Pre-Launch):
- Production launch checklist
- Agency pilot outreach (3 targets)
- Pilot onboarding materials

### 🔮 Future (Post-Pilot):
- PDF export polish
- Advanced ML scoring (win probability)
- Mobile UI optimization
- Full JAB P-ATO certification
- White-label offering
- API for third-party integrations

---

## 💰 Pricing

- **Starter:** $99/month
- **Pro:** $399/month
- **Enterprise:** $5k–$25k/year (custom)

See [PRICING.md](./PRICING.md) for details.

---

## 👥 Target Customers

1. **Small GovCon Firms** (1–50 employees)
2. **Federal Agencies** (OSDBU, contracting offices)
3. **Prime Contractors** (proposal teams)
4. **State/Local Government** (procurement offices)

---

## 🔒 Security & Compliance

- **FedRAMP Moderate–aligned** (not certified)
- **NIST 800-53 Rev. 5** controls implemented
- **Audit logging** (immutable)
- **RBAC + RLS** (team isolation)
- **MFA enforced**
- **Encryption** (in transit + at rest)
- **Data retention** (7-year default, legal hold support)

**Sales-Safe Language:**
- ✅ "FedRAMP Moderate–aligned architecture"
- ✅ "NIST 800-53 controls implemented"
- ✅ "Prepared for agency ATO sponsorship"
- ❌ "FedRAMP certified" (not yet)

---

## 📞 Contact

**Website:** [Coming Soon]  
**Email:** [Your Email]  
**GitHub:** [Haroldtrapier/sturgeon-ai-prod](https://github.com/Haroldtrapier/sturgeon-ai-prod)  

---

## 📄 License

Proprietary. All rights reserved.

---

**Built for GovCon. Ready for agencies. Launch-ready.**
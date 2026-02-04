# STURGEON AI - MASTER DOCUMENTATION
**Government Contracting Intelligence Platform**  
**Service-Disabled Veteran-Owned Small Business (SDVOSB)**  
**Trapier Management LLC**

---

## 📚 Repository Overview

Sturgeon AI consists of two primary repositories serving different purposes:

### 1. [sturgeon-ai](https://github.com/Haroldtrapier/sturgeon-ai) - Design Prototype
- **Purpose:** Static HTML prototype and design system
- **Size:** 41.5 MB (103 files)
- **Language:** HTML/CSS/JavaScript
- **Status:** Reference implementation
- **Use Case:** Design mockups, UI/UX exploration, client demos

**Key Contents:**
- 87 HTML page templates covering all platform features
- Design system (CSS, JavaScript)
- Complete UI/UX specifications
- Landing pages and marketing materials

### 2. [sturgeon-ai-prod](https://github.com/Haroldtrapier/sturgeon-ai-prod) - Production System
- **Purpose:** Full-stack production application
- **Size:** 1.1 MB (298 files)
- **Language:** Python (Backend) + TypeScript/Next.js (Frontend)
- **Status:** **Production-ready** ✅
- **Use Case:** Live platform serving customers

**Key Contents:**
- FastAPI backend with SAM.gov integration
- Next.js 14 frontend with React Server Components
- PostgreSQL database (Supabase)
- 6 AI agents powered by Claude Sonnet 4
- Complete authentication and billing systems

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                  STURGEON AI ECOSYSTEM                       │
└─────────────────────────────────────────────────────────────┘
                              │
                    ┌─────────┴─────────┐
                    │                   │
        ┌───────────▼──────────┐  ┌────▼──────────────────┐
        │   sturgeon-ai         │  │  sturgeon-ai-prod     │
        │   (Design System)     │  │  (Production App)     │
        │                       │  │                       │
        │  • 87 HTML pages      │  │  • FastAPI backend    │
        │  • CSS/JS framework   │  │  • Next.js frontend   │
        │  • Design specs       │  │  • Supabase DB        │
        │  • UI components      │  │  • 6 AI Agents        │
        │                       │  │  • Stripe billing     │
        └───────────────────────┘  └───────────────────────┘
                Reference                  Production
                Implementation             Deployment
```

---

## 🎯 Platform Capabilities

### Core Features
1. **Opportunity Intelligence**
   - Real-time SAM.gov integration (500K+ opportunities)
   - AI-powered opportunity matching (ContractMatch)
   - Advanced search and filtering
   - Automated alerts and notifications

2. **Proposal Generation**
   - AI-assisted proposal writing
   - Template library and content reuse
   - Compliance verification
   - Win theme generation

3. **Compliance Management**
   - SDVOSB, 8(a), HUBZone certifications
   - CMMC/NIST 800-171 guidance
   - FAR/DFARS reference library
   - SAM.gov registration tracking

4. **Market Intelligence**
   - Agency spending analysis ($500B+ tracked)
   - Competitor intelligence
   - Industry trend forecasting
   - Teaming partner finder

5. **Six AI Agents**
   - 🔍 Research Agent
   - 📊 Opportunity Analyst
   - ⚖️ Compliance Specialist
   - ✍️ Proposal Writing Assistant
   - 📈 Market Intelligence Analyst
   - 💬 General Assistant

---

## 🛠️ Technology Stack

### Frontend (sturgeon-ai-prod)
- **Framework:** Next.js 14.2 (App Router)
- **Language:** TypeScript 5.3+
- **Styling:** Tailwind CSS + Shadcn UI
- **State:** React Server Components
- **Auth:** Clerk

### Backend (sturgeon-ai-prod)
- **Framework:** FastAPI (Python 3.11+)
- **Database:** PostgreSQL 15 (Supabase)
- **AI:** Anthropic Claude Sonnet 4
- **Payments:** Stripe
- **Email:** Resend
- **Hosting:** Vercel (frontend) + Railway (backend)

### Integrations
- SAM.gov API
- FPDS-NG (Federal Procurement Data System)
- USASpending.gov
- Grants.gov
- Beta.SAM.gov

---

## 📦 Repository Structure Comparison

| Feature | sturgeon-ai | sturgeon-ai-prod |
|---------|-------------|------------------|
| **Purpose** | Design prototype | Production app |
| **Files** | 103 | 298 |
| **Size** | 41.5 MB | 1.1 MB |
| **Pages/Routes** | 87 HTML pages | 87 Next.js routes |
| **Backend** | None | FastAPI + Python |
| **Database** | None | PostgreSQL (Supabase) |
| **Authentication** | Mockup | Clerk (production) |
| **AI Agents** | None | 6 Claude Sonnet agents |
| **Payment** | Mockup | Stripe (live) |
| **Deployment** | Static hosting | Vercel + Railway |

---

## 📄 Documentation Files

### Core Documentation
- **THIS FILE:** Master overview combining both repositories
- **MASTER_SPECIFICATION.md:** Complete 87-page technical specification
- **ARCHITECTURE.md:** Unified system architecture
- **API_DOCUMENTATION.md:** All API endpoints and schemas
- **DATABASE_SCHEMA.md:** Complete PostgreSQL schema
- **DEPLOYMENT_GUIDE.md:** Production deployment instructions

### Repository-Specific Docs
- `sturgeon-ai/README.md` - Design system documentation
- `sturgeon-ai/DOCUMENTATION.md` - Page-by-page specifications
- `sturgeon-ai-prod/README.md` - Production system setup
- `sturgeon-ai-prod/MASTER_SPECIFICATION.md` - Full technical spec

---

## 🚀 Quick Start

### For Designers (sturgeon-ai)
```bash
git clone https://github.com/Haroldtrapier/sturgeon-ai.git
cd sturgeon-ai
open index.html
```

### For Developers (sturgeon-ai-prod)
```bash
git clone https://github.com/Haroldtrapier/sturgeon-ai-prod.git
cd sturgeon-ai-prod

# Install dependencies
npm install
pip install -r backend/requirements.txt

# Set up environment
cp .env.example .env.local
# Configure: Clerk, Supabase, Anthropic, Stripe keys

# Run development
npm run dev              # Frontend (localhost:3000)
cd backend && python main.py  # Backend (localhost:8000)
```

---

## 🎨 Design to Development Workflow

1. **Design Phase:** Create/modify HTML mockups in `sturgeon-ai`
2. **Review:** Validate UX with stakeholders
3. **Development:** Implement as Next.js components in `sturgeon-ai-prod`
4. **Integration:** Connect to backend APIs and database
5. **Testing:** Verify functionality and performance
6. **Deploy:** Push to production (Vercel)

---

## 📊 Current Status (February 2026)

### sturgeon-ai (Design System)
- ✅ 87 pages fully designed
- ✅ Complete UI/UX specifications
- ✅ Responsive design system
- ✅ All user flows documented

### sturgeon-ai-prod (Production)
- ✅ Authentication (Clerk)
- ✅ Database (Supabase - 15 tables)
- ✅ SAM.gov integration (500K+ opportunities)
- ✅ 6 AI agents (Claude Sonnet 4)
- ✅ Billing (Stripe - 3 tiers)
- ✅ Core dashboard and search
- 🔄 Proposal builder (in progress)
- 🔄 Advanced analytics (in progress)
- 📅 Admin panel (planned)

---

## 💰 Pricing & Business Model

### Subscription Tiers
1. **Starter:** $97/month
   - 100 opportunities/month
   - 10 proposals/month
   - 1 user

2. **Professional:** $197/month ⭐ Most Popular
   - Unlimited opportunities
   - Unlimited proposals
   - 5 users
   - Priority support

3. **Enterprise:** $397/month
   - Everything in Professional
   - 20 users
   - White-label
   - SSO/SAML
   - Dedicated support

### Target Market
- Small businesses (< 500 employees)
- SDVOSB, 8(a), HUBZone certified companies
- First-time government contractors
- Prime contractors seeking teaming partners

**Total Addressable Market:** 680,000+ small businesses in federal contracting

---

## 🔒 Security & Compliance

- **Authentication:** Clerk (SOC 2 Type II)
- **Database:** Supabase (Row-Level Security)
- **Infrastructure:** Vercel (ISO 27001)
- **Payments:** Stripe (PCI DSS Level 1)
- **Data Encryption:** At-rest and in-transit
- **Backups:** Automated daily backups
- **GDPR:** Compliant data handling

---

## 📈 Success Metrics

### Technical KPIs
- Uptime: > 99.9%
- API response: < 500ms (p95)
- Page load: < 2s
- Error rate: < 0.1%

### Business KPIs
- Trial → Paid conversion: > 15%
- MRR growth: > 10% monthly
- Churn rate: < 5%
- NPS score: > 50

---

## 🤝 Contributing

### Design Contributions (sturgeon-ai)
1. Fork the repository
2. Create HTML mockups
3. Follow existing CSS patterns
4. Submit pull request

### Code Contributions (sturgeon-ai-prod)
1. Fork the repository
2. Create feature branch
3. Write tests
4. Follow TypeScript/Python style guides
5. Submit pull request with detailed description

---

## 📞 Contact

**Harold Trapier**  
CEO, Trapier Management LLC  
📧 harold@trapier.com  
🌐 [sturgeonai.com](https://sturgeonai.com)  
📍 Charlotte, NC 28202

---

## 📝 License

Copyright © 2026 Trapier Management LLC  
All rights reserved.

---

## 🗺️ Roadmap

### Q1 2026 (Current)
- ✅ Core platform MVP
- ✅ SAM.gov integration
- ✅ AI agents deployment
- 🔄 Beta testing (50 users)

### Q2 2026
- 📅 Proposal builder completion
- 📅 Advanced analytics dashboard
- 📅 Mobile app (iOS/Android)
- 📅 Public launch (target: 100 customers)

### Q3 2026
- 📅 API marketplace
- 📅 Partner integrations (Salesforce, HubSpot)
- 📅 White-label offering
- 📅 Enterprise features (SSO, custom domains)

### Q4 2026
- 📅 AI agent customization
- 📅 Automated proposal generation
- 📅 Predictive win probability ML model
- 📅 Expand to state/local contracts

---

## 🎯 Strategic Vision

**Mission:** Democratize access to government contracts for small businesses through AI-powered intelligence.

**Vision:** Become the #1 platform for SDVOSB and small businesses competing for federal contracts.

**Values:**
- Veteran-first
- Innovation through AI
- Transparency
- Customer success

---

## 📚 Additional Resources

- [Full Technical Specification](./MASTER_SPECIFICATION.md) (87 pages)
- [API Documentation](./API_DOCUMENTATION.md)
- [Database Schema](./DATABASE_SCHEMA.md)
- [Deployment Guide](./DEPLOYMENT_GUIDE.md)
- [User Guide](https://docs.sturgeonai.com)
- [Video Tutorials](https://youtube.com/@sturgeonai)

---

**Last Updated:** February 04, 2026  
**Version:** 2.0  
**Status:** ✅ Production-Ready

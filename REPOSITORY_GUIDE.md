# STURGEON AI - REPOSITORY GUIDE

**Understanding the Sturgeon AI Ecosystem**

Last Updated: February 4, 2026

---

## 🎯 PURPOSE

This guide explains the relationship between the two main Sturgeon AI repositories and how they work together in the development process.

---

## 📦 REPOSITORIES OVERVIEW

### 1. sturgeon-ai-prod ⭐ **[YOU ARE HERE]**
**GitHub:** `Haroldtrapier/sturgeon-ai-prod`  
**Purpose:** Production application (full-stack)  
**Status:** 🚀 Active Development  
**Size:** 298 files (1.1 MB)

**What's Inside:**
- ✅ Next.js 14 + TypeScript frontend
- ✅ Python FastAPI backend services
- ✅ Supabase database integration
- ✅ Clerk authentication
- ✅ AI agent implementations
- ✅ SAM.gov API integration
- ✅ Deployment configurations
- ✅ CI/CD pipelines
- ✅ Test suites

**Tech Stack:**
```
Frontend:  Next.js 14, TypeScript, Tailwind CSS, Shadcn UI
Backend:   Python FastAPI, PostgreSQL, Supabase
AI:        Anthropic Claude Sonnet 4
Auth:      Clerk
Payments:  Stripe
Hosting:   Vercel (frontend), Railway (backend)
```

**When to Use:**
- ✅ Writing production code
- ✅ Implementing features
- ✅ API development
- ✅ Database migrations
- ✅ Deployment & testing

---

### 2. sturgeon-ai
**GitHub:** `Haroldtrapier/sturgeon-ai`  
**Purpose:** UI/UX prototype & design reference  
**Status:** 📐 Reference Material  
**Size:** 103 files (41.5 MB)

**What's Inside:**
- 📄 87 HTML page wireframes
- 🎨 Complete UI/UX designs
- 📋 Feature specifications
- 🗺️ Navigation flows
- 📐 Layout templates
- 📚 Design documentation

**Tech Stack:**
```
Simple:    HTML, CSS, JavaScript
Purpose:   Design mockups and specifications
```

**When to Use:**
- ✅ Designing new pages/features
- ✅ Understanding user flows
- ✅ Quick prototyping
- ✅ Gathering requirements
- ✅ UI/UX reference during development

---

## 🔄 HOW THEY WORK TOGETHER

### Development Workflow

```
┌─────────────────────────────────────────────────────────┐
│                    DESIGN PHASE                          │
│  ┌───────────────────────────────────────────────────┐  │
│  │  1. Create HTML prototype in sturgeon-ai          │  │
│  │     • Quick iteration                             │  │
│  │     • No build process                            │  │
│  │     • Focus on UX                                 │  │
│  └───────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────┐
│                  SPECIFICATION PHASE                     │
│  ┌───────────────────────────────────────────────────┐  │
│  │  2. Document requirements from prototype          │  │
│  │     • Page layouts                                │  │
│  │     • Component specs                             │  │
│  │     • User interactions                           │  │
│  │     • API requirements                            │  │
│  └───────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────┐
│                 IMPLEMENTATION PHASE                     │
│  ┌───────────────────────────────────────────────────┐  │
│  │  3. Build in sturgeon-ai-prod                     │  │
│  │     • Convert HTML → React components             │  │
│  │     • Implement API routes                        │  │
│  │     • Connect to Supabase                         │  │
│  │     • Add authentication                          │  │
│  │     • Deploy to production                        │  │
│  └───────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

### Example: Adding a New Feature

**Step 1: Design (sturgeon-ai)**
```html
<!-- pages/new-feature.html -->
<html>
  <head>
    <title>New Feature</title>
    <link rel="stylesheet" href="../css/main.css">
  </head>
  <body>
    <div class="container">
      <h1>New Feature</h1>
      <form>
        <input type="text" name="input" />
        <button>Submit</button>
      </form>
    </div>
  </body>
</html>
```

**Step 2: Implement (sturgeon-ai-prod)**
```tsx
// app/new-feature/page.tsx
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

export default function NewFeaturePage() {
  return (
    <div className="container">
      <h1>New Feature</h1>
      <form>
        <Input name="input" />
        <Button>Submit</Button>
      </form>
    </div>
  )
}
```

---

## 📊 FEATURE COMPARISON

| Feature | sturgeon-ai (Prototype) | sturgeon-ai-prod (Production) |
|---------|-------------------------|-------------------------------|
| **Pages** | 87 HTML pages | ~40 React pages (growing) |
| **Purpose** | Design & specs | Production app |
| **Deployment** | Not deployed | Vercel + Railway |
| **Database** | None (static) | Supabase PostgreSQL |
| **Auth** | Mockup only | Clerk (full auth) |
| **AI Agents** | Design specs | 6 working agents |
| **Payments** | Design only | Stripe integration |
| **Testing** | Manual review | Automated tests |
| **CI/CD** | None | GitHub Actions |

---

## 🗺️ PAGE MAPPING

### Completed Migrations
| HTML Page (sturgeon-ai) | React Page (sturgeon-ai-prod) | Status |
|-------------------------|-------------------------------|--------|
| `index.html` | `app/page.tsx` | ✅ Done |
| `pages/dashboard/overview.html` | `app/dashboard/page.tsx` | ✅ Done |
| `pages/opportunities/search.html` | `app/opportunities/page.tsx` | ✅ Done |
| `pages/ai-chat/assistant.html` | `app/chat/page.tsx` | ✅ Done |
| `pages/system/profile.html` | `app/profile/page.tsx` | ✅ Done |

### In Progress
| HTML Page | React Page | Status |
|-----------|------------|--------|
| `pages/proposals/create.html` | `app/proposals/new/page.tsx` | 🔄 In Progress |
| `pages/opportunities/details.html` | `app/opportunities/[id]/page.tsx` | 🔄 In Progress |
| `pages/compliance/sam.html` | `app/compliance/sam/page.tsx` | 🔄 In Progress |

### Planned
| HTML Page | React Page | Status |
|-----------|------------|--------|
| `pages/certification/sdvosb.html` | `app/certifications/sdvosb/page.tsx` | ⏳ Planned |
| `pages/research/analytics.html` | `app/research/trends/page.tsx` | ⏳ Planned |
| `pages/pro/billing.html` | `app/billing/page.tsx` | ⏳ Planned |

---

## 🎨 DESIGN SYSTEM

### HTML Prototype (sturgeon-ai)
```css
/* css/main.css */
.container { max-width: 1200px; }
.btn-primary { background: #0066cc; }
.card { border: 1px solid #ddd; }
```

### Production App (sturgeon-ai-prod)
```tsx
// Using Tailwind CSS + Shadcn UI
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

<div className="container max-w-7xl">
  <Card>
    <Button>Click Me</Button>
  </Card>
</div>
```

---

## 📁 FILE STRUCTURE COMPARISON

### sturgeon-ai (Prototype)
```
sturgeon-ai/
├── index.html
├── pages/
│   ├── dashboard/
│   ├── opportunities/
│   ├── proposals/
│   └── ...
├── css/
│   └── main.css
├── js/
│   └── main.js
└── docs/
```

### sturgeon-ai-prod (Production)
```
sturgeon-ai-prod/
├── app/                    # Next.js pages
│   ├── api/                # API routes
│   ├── dashboard/
│   ├── opportunities/
│   └── ...
├── backend/                # Python services
│   ├── routers/
│   ├── services/
│   └── models/
├── components/             # React components
├── lib/                    # Utilities
├── supabase/               # Database
└── .github/                # CI/CD
```

---

## 🚀 DEPLOYMENT

### sturgeon-ai (Prototype)
```
❌ Not deployed to production
✅ Can view locally: open index.html
✅ Use for reference during development
```

### sturgeon-ai-prod (Production)
```
✅ Frontend: Vercel (app.sturgeonai.com)
✅ Backend: Railway (api.sturgeonai.com)
✅ Database: Supabase (hosted)
✅ Auto-deploy on push to main
```

---

## 💡 BEST PRACTICES

### When Working on sturgeon-ai (Prototype)
1. ✅ Focus on design and UX
2. ✅ Use simple HTML/CSS/JS
3. ✅ Document requirements clearly
4. ✅ Create reusable patterns
5. ❌ Don't worry about production concerns

### When Working on sturgeon-ai-prod (Production)
1. ✅ Follow TypeScript best practices
2. ✅ Write tests for critical paths
3. ✅ Use design from prototype as reference
4. ✅ Ensure database migrations are reversible
5. ✅ Deploy frequently to staging

---

## 📚 DOCUMENTATION STRUCTURE

### In sturgeon-ai (Prototype)
- `README.md` - HTML prototype overview
- `DOCUMENTATION.md` - Page specifications
- `BUILD_SUMMARY.md` - Design decisions

### In sturgeon-ai-prod (Production)
- `README.md` - Production app overview
- `MASTER_SPECIFICATION.md` - Complete system spec ⭐
- `UNIFIED_ARCHITECTURE.md` - Architecture across both repos ⭐
- `REPOSITORY_GUIDE.md` - This file ⭐
- `DEPLOYMENT_GUIDE.md` - How to deploy
- `TROUBLESHOOTING.md` - Common issues

---

## ❓ FAQ

**Q: Which repo should I use for new development?**  
A: Always use **sturgeon-ai-prod** for production code. Use **sturgeon-ai** only for design prototyping.

**Q: Can I delete sturgeon-ai?**  
A: No! Keep it as a design reference. It documents all 87 pages and serves as living specifications.

**Q: Why two repos instead of one?**  
A: Separating design (HTML) from production (React/TypeScript) allows rapid prototyping without affecting the production codebase. It also serves as clear specifications for the entire system.

**Q: How do I contribute?**  
A: For production features, fork **sturgeon-ai-prod** and submit PRs. For design improvements, update **sturgeon-ai**.

**Q: Where is the master specification?**  
A: The complete 87-page specification is in **sturgeon-ai-prod/MASTER_SPECIFICATION.md**.

---

## 🔗 RELATED DOCUMENTS

- [MASTER_SPECIFICATION.md](./MASTER_SPECIFICATION.md) - Complete 87-page system specification
- [UNIFIED_ARCHITECTURE.md](./UNIFIED_ARCHITECTURE.md) - System architecture across both repos
- [README.md](./README.md) - Production app overview
- [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) - Deployment instructions

---

**Questions?**  
Email: harold@trapier.com

**Created by:**  
Harold Trapier  
Trapier Management LLC  
Charlotte, NC

**Last Updated:** February 4, 2026
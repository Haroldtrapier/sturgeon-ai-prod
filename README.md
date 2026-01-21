# 🐟 Sturgeon AI - Government Contracting Intelligence Platform

AI-powered platform for government contract analysis, proposal generation, and opportunity matching.

## 🚀 Quick Start

### Prerequisites

- Node.js 22.x or later
- Supabase account (for database)
- OpenAI API key (for AI features)
- Vercel account (for deployment)

### 1. Clone and Install

```bash
git clone https://github.com/Haroldtrapier/sturgeon-ai-prod.git
cd sturgeon-ai-prod
npm install
```

### 2. Environment Setup

Create `.env.local` file:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Backend API (optional, for AI features)
BACKEND_URL=https://your-backend.railway.app
# OR
NEXT_PUBLIC_API_URL=http://localhost:8000

# Optional: OpenAI (if using direct integration)
OPENAI_API_KEY=your_openai_key
```

### 3. Database Setup

Run the Supabase migration:

```bash
# In Supabase SQL Editor, run:
supabase/migrations/001_create_opportunities.sql
```

Or use Supabase CLI:

```bash
supabase db push
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## 🏗️ Architecture

### Frontend (Next.js 14)
- **Framework**: Next.js 14 with App Router
- **Styling**: TailwindCSS
- **Auth**: Supabase Auth
- **Database**: Supabase (PostgreSQL)

### Backend (FastAPI - Optional)
- **Framework**: FastAPI
- **AI Engine**: OpenAI / Custom Agent
- **Deployment**: Railway

### Key Features

1. **Opportunity Import** - Import from SAM.gov, GovWin, Unison, FPDS, etc.
2. **AI Analysis** - Chat with AI about opportunities
3. **Proposal Generation** - AI-powered proposal drafting
4. **User Dashboard** - Track saved opportunities

## 📦 API Endpoints

### Frontend (Next.js API Routes)

- `POST /api/opportunities/import` - Save opportunity
- `GET /api/opportunities/import` - List user's opportunities
- `POST /api/agent` - Chat with AI assistant
- `GET /api/health` - Health check

### Backend (FastAPI)

- `GET /health` - Health check
- `POST /agent/chat` - AI chat endpoint
- `POST /opportunities/parse` - Parse opportunity text

## 🗎️ Database Schema

### opportunities table

```sql
id: uuid (primary key)
user_id: uuid (foreign key to auth.users)
source: text (sam, govwin, unison, etc.)
source_url: text
title: text
agency: text
solicitation_id: text
due_date: timestamptz
raw_text: text
parsed_json: jsonb
created_at: timestamptz
updated_at: timestamptz
```

## 🚀 Deployment

### Deploy to Vercel (Frontend)

```bash
vercel --prod
```

Or connect your GitHub repo to Vercel for automatic deployments.

**Required Environment Variables in Vercel:**
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `BACKEND_URL` (if using separate backend)

### Deploy Backend to Railway

```bash
cd backend
railway up
```

**Required Environment Variables in Railway:**
- `OPENAI_API_KEY`
- `DATABASE_URL` (if using database)
- `CORS_ORIGINS` (your Vercel domain)

## 🛠️ Development

### Project Structure

```
sturgeon-ai-prod/
├── app/                    # Next.js app directory
│   ├── api/                # API routes
│   │   ├── agent/          # AI chat endpoint
│   │   └── opportunities/  # Opportunity endpoints
│   ├── agent/              # AI assistant page
│   ├── marketplaces/       # Marketplace integrations
│   └── opportunities/      # Opportunities list
├── components/            # React components
├── lib/                   # Utilities
│   ├── supabase/          # Supabase client
│   └── hooks/             # Custom React hooks
├── backend/               # FastAPI backend (separate)
└── supabase/              # Database migrations
```

### Adding New Marketplace

1. Create new page: `app/marketplaces/[name]/page.tsx`
2. Use `MarketplaceImport` component:

```tsx
import MarketplaceImport from '@/components/MarketplaceImport';

export default function NewMarketplacePage() {
  return (
    <MarketplaceImport
      source="marketplace-key"
      sourceName="Marketplace Name"
      loginUrl="https://marketplace.url"
      description="Description here"
    />
  );
}
```

3. Add link in `app/marketplaces/page.tsx`

## 🐛 Troubleshooting

### Build Errors

**Error: "Module not found: @/lib/supabase/client"**
- Ensure `lib/supabase/client.ts` exists
- Check `tsconfig.json` has `"@/*": ["./*"]` in paths

**Error: "useRouter can only be used in Client Components"**
- Add `'use client'` directive at top of file
- Change import from `next/router` to `next/navigation`

### Database Issues

**Error: "relation 'opportunities' does not exist"**
- Run the migration: `supabase/migrations/001_create_opportunities.sql`
- Check Supabase connection in `.env.local`

### API Issues

**Error: "BACKEND_URL is not set"**
- Backend is optional for basic features
- AI chat will show fallback message
- Add `BACKEND_URL` env var to enable full AI features

## 📚 Documentation

- [Next.js Docs](https://nextjs.org/docs)
- [Supabase Docs](https://supabase.com/docs)
- [TailwindCSS Docs](https://tailwindcss.com/docs)

## 🔐 Security

- All API routes verify user authentication
- Row Level Security (RLS) enabled on database
- Users can only access their own data
- Environment variables never exposed to client

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Open Pull Request

## 📝 License

Private - All rights reserved

## 📧 Support

For issues or questions, contact: info@trapiermanagement.com

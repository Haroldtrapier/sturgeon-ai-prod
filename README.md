# sturgeon-ai-prod
Sturgeon AI - Government Contract Analysis System. Production-ready full-stack platform with rate limiting, monitoring, and structured logging.

## Features

### Alerts / Saved Searches
The alerts feature allows users to create saved searches that can be monitored for new opportunities across various marketplaces (SAM, Unison, GovWin, GovSpend).

**Location:** `/alerts`

**Key Components:**
- Form to create new alerts with name, keyword query, and marketplace
- List view of all saved alerts
- API endpoints for creating and retrieving alerts

## Setup

1. Clone the repository
2. Install dependencies: `npm install`
3. Copy `.env.example` to `.env.local` and configure:
   - `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anonymous key
4. Run database migrations from `backend/schema.sql`
5. Start development server: `npm run dev`

## Development

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking

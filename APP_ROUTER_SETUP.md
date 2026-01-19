# 📱 App Router Setup - Opportunities Page

## What Was Created

### 1. App Router Structure
```
app/
├── layout.tsx              # Root layout for App Router
├── globals.css             # Global styles with Tailwind
└── opportunities/
    └── page.tsx            # Opportunities page with Railway API integration
```

### 2. Updated Files
- `tsconfig.json` - Added path aliases (`@/*`) for cleaner imports
- `lib/api.ts` - Already created (connects to Railway backend)

---

## Features

### Opportunities Page (`app/opportunities/page.tsx`)

✅ **Authentication**
- Uses Supabase to check if user is logged in
- Redirects to `/login` if not authenticated
- Matches the auth pattern from your existing dashboard

✅ **Railway Backend Integration**
- Uses `lib/api.ts` to call Railway backend
- Calls `/api/opportunities/search` endpoint
- Handles errors gracefully with user-friendly messages

✅ **Search Functionality**
- Search by keywords (e.g., "AI", "software")
- Filter by agency (e.g., "DOD", "GSA", "NASA")
- Real-time search with loading states

✅ **UI/UX**
- Modern, responsive design with Tailwind CSS
- Loading states and error handling
- Opportunity cards with key information
- Set-aside badges, deadlines, agency info

---

## How It Works

### 1. Authentication Flow
```typescript
// Checks Supabase auth on page load
const { data } = await supabase.auth.getUser();
if (!data?.user) router.push("/login");
```

### 2. API Integration
```typescript
// Uses lib/api.ts to call Railway backend
import { apiFetch } from "@/lib/api";

const response = await apiFetch<OpportunitiesResponse>(
  `/api/opportunities/search?keywords=AI&agency=DOD`
);
```

### 3. Backend Endpoint
The Railway backend (`backend/main.py`) provides:
- `GET /api/opportunities/search?keywords=...&agency=...&limit=50`
- Returns opportunities from SAM.gov API

---

## Environment Variables Required

### For Frontend (Vercel/Local)
```env
# Railway Backend URL
NEXT_PUBLIC_API_URL=https://your-app.railway.app

# Supabase Auth
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

---

## Usage

### Access the Page
Once deployed, users can access:
- **URL**: `/opportunities`
- **Requires**: Authentication (redirects to login if not logged in)

### Search Opportunities
1. Enter keywords (optional)
2. Enter agency name (optional)
3. Click "Search"
4. Results display in cards below

---

## Next Steps

### 1. Test Locally
```bash
# Make sure environment variables are set in .env.local
npm run dev

# Visit http://localhost:3000/opportunities
```

### 2. Deploy to Vercel
- Ensure `NEXT_PUBLIC_API_URL` is set in Vercel environment variables
- Deploy and test the page

### 3. Enhance Features (Optional)
- Add pagination for large result sets
- Add filters (NAICS codes, set-asides, etc.)
- Add "Save" functionality to save opportunities
- Add detail view for individual opportunities
- Add export functionality

---

## File Structure

```
sturgeon-ai-prod/
├── app/                          # ✅ App Router (Next.js 13+)
│   ├── layout.tsx                # Root layout
│   ├── globals.css               # Global styles
│   └── opportunities/
│       └── page.tsx              # Opportunities page
├── lib/
│   └── api.ts                    # ✅ Railway API client
├── pages/                        # Pages Router (existing)
│   ├── dashboard.tsx
│   ├── login.tsx
│   └── ...
└── tsconfig.json                 # ✅ Updated with path aliases
```

---

## Notes

- **App Router vs Pages Router**: Your project now uses both:
  - **App Router** (`app/`): New opportunities page
  - **Pages Router** (`pages/`): Existing pages (dashboard, login, etc.)
  
  Both work together! Next.js will route to the appropriate one.

- **Path Aliases**: You can now use `@/` imports:
  ```typescript
  import { apiFetch } from "@/lib/api";
  // Instead of: import { apiFetch } from "../../lib/api";
  ```

- **Styling**: Uses Tailwind CSS (already in your dependencies)

---

## Troubleshooting

### "Cannot find module '@/lib/api'"
- ✅ Check `tsconfig.json` has `paths` configured (already done)
- ✅ Restart your dev server: `npm run dev`

### "Missing required env var: NEXT_PUBLIC_API_URL"
- ✅ Set `NEXT_PUBLIC_API_URL` in `.env.local` (local) or Vercel (production)
- ✅ Value should be your Railway backend URL

### "API 404" or connection errors
- ✅ Verify Railway backend is deployed and running
- ✅ Check Railway backend URL is correct
- ✅ Test backend directly: `curl https://your-app.railway.app/health`

### Authentication not working
- ✅ Verify Supabase environment variables are set
- ✅ Check user is logged in via Supabase

---

Done! 🎉 Your opportunities page is ready to use.

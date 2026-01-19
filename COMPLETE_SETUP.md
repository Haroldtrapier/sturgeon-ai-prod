# 🚀 Complete Railway + Supabase + Frontend Setup

## Architecture Overview

```
┌─────────────────┐         ┌─────────────────┐         ┌─────────────────┐
│   Next.js App   │────────▶│  FastAPI Backend │────────▶│  Supabase DB    │
│   (Vercel)      │  API    │   (Railway)      │  SQL    │   (PostgreSQL)  │
│                 │         │                 │         │                 │
│ Uses:           │         │ Uses:           │         │ Uses:           │
│ - Supabase Auth │         │ - DATABASE_URL   │         │ - Connection    │
│ - API calls     │         │ - OPENAI_API_KEY │         │   String        │
└─────────────────┘         └─────────────────┘         └─────────────────┘
```

---

## Step-by-Step Complete Setup

### Part 1: Supabase Setup

1. **Create Supabase Project**
   - Go to https://supabase.com/dashboard
   - Click "New Project"
   - Name: `sturgeon-ai`
   - Region: `us-east-1`
   - Set database password (save it!)
   - Wait 5-10 minutes for initialization

2. **Get Supabase Credentials**
   - **Settings → Database**: Copy PostgreSQL connection string (URI format)
   - **Settings → API**: Copy:
     - Project URL: `https://xxx.supabase.co`
     - anon key: `eyJ...`
     - service_role key: `eyJ...`

3. **Initialize Database Schema**
   - Go to **SQL Editor** → New Query
   - Paste contents of `backend/schema.sql`
   - Click **Run**

---

### Part 2: Railway Backend Setup

1. **Exit Current Prompt** (if still in `railway add`)
   - Press `Esc` or `Ctrl+C`

2. **Navigate to Backend**
   ```bash
   cd backend
   ```

3. **Set Railway Environment Variables**
   ```bash
   # Database connection (from Supabase)
   railway variables --set "DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres"
   
   # API keys
   railway variables --set "OPENAI_API_KEY=your-openai-key-here"
   
   # Port
   railway variables --set "PORT=8000"
   ```

4. **Deploy Backend**
   ```bash
   railway up
   ```

5. **Get Railway Backend URL**
   - Go to Railway Dashboard → Your Project → Your Service
   - Settings → Public Networking
   - Generate domain (if needed)
   - Copy URL: `https://your-app-production.up.railway.app`

---

### Part 3: Vercel Frontend Setup

1. **Set Environment Variables in Vercel**
   - Go to Vercel Dashboard → Your Project → Settings → Environment Variables
   - Add these variables:

   ```bash
   # Railway Backend URL (from Part 2, Step 5)
   NEXT_PUBLIC_API_URL=https://your-app-production.up.railway.app
   
   # Supabase Configuration (from Part 1, Step 2)
   NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
   
   # Server-side Supabase (for API routes)
   SUPABASE_URL=https://xxx.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
   ```

2. **For Local Development (`.env.local`)**
   Create/update `.env.local` in project root:
   ```env
   NEXT_PUBLIC_API_URL=https://your-app-production.up.railway.app
   NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
   SUPABASE_URL=https://xxx.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
   ```

3. **Redeploy Vercel** (if needed)
   - Changes to environment variables require redeployment
   - Go to Deployments → Redeploy

---

## Environment Variables Summary

### Railway (Backend/FastAPI)
| Variable | Source | Example |
|----------|--------|---------|
| `DATABASE_URL` | Supabase Dashboard | `postgresql://postgres:pass@db.xxx.supabase.co:5432/postgres` |
| `OPENAI_API_KEY` | OpenAI Dashboard | `sk-...` |
| `PORT` | Fixed | `8000` |

### Vercel (Frontend/Next.js)
| Variable | Source | Example |
|----------|--------|---------|
| `NEXT_PUBLIC_API_URL` | Railway Dashboard | `https://your-app.railway.app` |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase Dashboard | `https://xxx.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase Dashboard | `eyJ...` |
| `SUPABASE_URL` | Supabase Dashboard | `https://xxx.supabase.co` |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase Dashboard | `eyJ...` |

---

## Testing the Connection

### 1. Test Railway Backend
```bash
# Check if backend is running
curl https://your-app.railway.app/health

# Should return: {"status":"healthy","timestamp":"..."}
```

### 2. Test Database Connection
```bash
# From Railway CLI
railway run psql $DATABASE_URL

# Or from Supabase Dashboard → SQL Editor
SELECT version();
```

### 3. Test Frontend → Backend
```typescript
// In your Next.js app
import { apiFetch } from '@/lib/api';

// Test API call
const result = await apiFetch('/health');
console.log(result); // Should show backend health status
```

### 4. Test Supabase Auth
- Go to your Next.js app: `https://your-app.vercel.app/login`
- Try logging in with a user from Supabase
- Should redirect to dashboard on success

---

## File Structure

```
sturgeon-ai-prod/
├── lib/
│   ├── api.ts                    # ✅ Frontend API client (uses NEXT_PUBLIC_API_URL)
│   ├── supabase-client.ts        # Frontend Supabase client
│   └── supabase-server.ts        # Server-side Supabase client
├── backend/
│   ├── config.py                 # ✅ Backend config (uses DATABASE_URL)
│   ├── main.py                   # FastAPI app
│   └── schema.sql                # Database schema
├── pages/
│   └── dashboard.tsx             # Uses Supabase for auth
└── .env.local                    # ✅ Local environment variables
```

---

## Troubleshooting

### Backend not accessible
- ✅ Check Railway deployment status
- ✅ Verify public domain is generated
- ✅ Check Railway variables are set correctly
- ✅ Verify `PORT=8000` is set

### Frontend can't connect to backend
- ✅ Verify `NEXT_PUBLIC_API_URL` is set in Vercel
- ✅ Check Railway backend URL is correct
- ✅ Verify CORS is enabled in FastAPI (should be `allow_origins=["*"]`)

### Database connection errors
- ✅ Verify `DATABASE_URL` is correct in Railway
- ✅ Check Supabase project is fully initialized
- ✅ Verify database password is correct
- ✅ Check if schema is initialized

### Authentication errors
- ✅ Verify Supabase keys are correct
- ✅ Check `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` in Vercel
- ✅ Verify user exists in Supabase Auth

---

## Quick Commands Reference

```bash
# Railway - Set variables
railway variables --set "KEY=VALUE"

# Railway - View variables
railway variables

# Railway - Deploy
railway up

# Railway - View logs
railway logs

# Railway - Connect to database
railway run psql $DATABASE_URL

# Vercel - Deploy
vercel --prod

# Vercel - View environment variables
vercel env ls
```

---

## Next Steps After Setup

1. ✅ Test all connections (backend, database, frontend)
2. ✅ Create test users in Supabase Auth
3. ✅ Test API endpoints from frontend
4. ✅ Set up monitoring/logging
5. ✅ Configure custom domains (optional)

Done! 🎉

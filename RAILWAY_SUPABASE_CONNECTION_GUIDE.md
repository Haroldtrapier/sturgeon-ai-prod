# 🚂 Railway + Supabase Connection Guide

## Current Situation

You're in the middle of a `railway add` command. Here's how to handle it:

### Option 1: Exit and Use Railway Dashboard (Recommended)

**To exit the current prompt:**
1. Press `Esc` key (as the prompt suggests)
2. Or press `Ctrl+C` to cancel the command

**Then use Railway Dashboard:**
1. Go to https://railway.app/dashboard
2. Select your project
3. Click "New" → "Database" → "Add PostgreSQL"
4. Railway will automatically create a PostgreSQL database and set `DATABASE_URL` environment variable

### Option 2: Complete the Current Prompt

If you want to add a service via CLI, you have two options:

**To add PostgreSQL database:**
- Type: `PostgreSQL` (or just press Enter if it's the default option)
- Then follow prompts to configure

**To add environment variables (if that's what you need):**
- Type: `KEY=VALUE` format (e.g., `OPENAI_API_KEY=your-key-here`)
- Press Enter after each variable
- Press `Esc` when finished

---

## Two Approaches: Railway PostgreSQL vs Supabase PostgreSQL

You have **two options** for connecting to a database:

### Approach A: Use Railway's PostgreSQL (Recommended for Railway Deployments)

Railway provides a managed PostgreSQL database that integrates seamlessly.

**Steps:**

1. **Add PostgreSQL to Railway:**
   ```bash
   # Exit current prompt first (Esc or Ctrl+C)
   railway add --database postgresql
   ```
   
   Or use Railway Dashboard:
   - Go to Railway Dashboard → Your Project → "New" → "Database" → "PostgreSQL"

2. **Railway automatically sets:**
   - `DATABASE_URL` - PostgreSQL connection string
   - `PGHOST`, `PGPORT`, `PGUSER`, `PGPASSWORD`, `PGDATABASE`

3. **Initialize your database schema:**
   ```bash
   # Connect to Railway database
   railway run psql $DATABASE_URL
   
   # Or use the connection string directly
   railway variables
   # Copy DATABASE_URL, then:
   psql $DATABASE_URL < backend/schema.sql
   ```

4. **For your FastAPI backend, add to Railway variables:**
   ```bash
   railway variables --set "OPENAI_API_KEY=your-key"
   railway variables --set "PORT=8000"
   ```

---

### Approach B: Use Supabase PostgreSQL (Recommended for Full Supabase Features)

If you want to use Supabase for authentication AND database, use Supabase's PostgreSQL.

**Steps:**

1. **Create Supabase Project:**
   - Go to https://supabase.com/dashboard
   - Click "New Project"
   - Name: `sturgeon-ai` (or `sturdeon-ai`)
   - Region: `us-east-1`
   - Set a strong database password
   - Wait 5-10 minutes for initialization

2. **Get Supabase Connection String:**
   - Go to Supabase Dashboard → Settings → Database
   - Under "Connection string", select "URI" tab
   - Copy the connection string (looks like):
     ```
     postgresql://postgres:[YOUR-PASSWORD]@db.xxxxx.supabase.co:5432/postgres
     ```

3. **Get Supabase API Keys:**
   - Go to Settings → API
   - Copy:
     - **Project URL**: `https://xxxxx.supabase.co`
     - **anon key**: `eyJ...` (public key)
     - **service_role key**: `eyJ...` (private key - keep secret!)

4. **Add to Railway Variables:**
   ```bash
   # Database connection
   railway variables --set "DATABASE_URL=postgresql://postgres:[PASSWORD]@db.xxxxx.supabase.co:5432/postgres"
   
   # Supabase configuration (for Next.js frontend)
   railway variables --set "SUPABASE_URL=https://xxxxx.supabase.co"
   railway variables --set "SUPABASE_ANON_KEY=your_anon_key_here"
   railway variables --set "SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here"
   
   # API keys
   railway variables --set "OPENAI_API_KEY=your-openai-key"
   ```

5. **Initialize Supabase Database Schema:**
   - Go to Supabase Dashboard → SQL Editor
   - Create new query
   - Paste contents of `backend/schema.sql`
   - Click "Run"

---

## Recommended Setup for Your Project

Based on your codebase, you have:
- **Frontend**: Next.js (deployed on Vercel, based on setup docs)
- **Backend**: FastAPI (deployed on Railway)
- **Database**: Needs PostgreSQL
- **Auth**: Uses Supabase Auth

**Recommended Architecture:**

```
Next.js (Vercel) 
  ↓
  Uses: SUPABASE_URL, SUPABASE_ANON_KEY (for auth)
  
FastAPI (Railway)
  ↓
  Uses: DATABASE_URL (from Supabase), OPENAI_API_KEY
```

**Why use Supabase PostgreSQL:**
- ✅ Already using Supabase for authentication
- ✅ Single source of truth for data
- ✅ Supabase provides real-time features, storage, etc.
- ✅ Easier to manage with Supabase dashboard

---

## Step-by-Step: Connect Railway to Supabase

### Step 1: Exit Current Railway Prompt

**Press `Esc` key** to exit the current interactive prompt.

### Step 2: Create/Get Supabase Credentials

1. Go to https://supabase.com/dashboard
2. Create or select your project
3. Get these values:
   - Database connection string (Settings → Database → Connection string → URI)
   - Project URL (Settings → API)
   - Anon key (Settings → API)
   - Service role key (Settings → API)

### Step 3: Set Railway Variables

```bash
# Make sure you're in the backend directory
cd backend

# Set database connection
railway variables --set "DATABASE_URL=postgresql://postgres:[PASSWORD]@db.xxxxx.supabase.co:5432/postgres"

# Set Supabase config (if your backend needs it)
railway variables --set "SUPABASE_URL=https://xxxxx.supabase.co"
railway variables --set "SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here"

# Set API keys
railway variables --set "OPENAI_API_KEY=your-openai-key-here"

# Set port (for FastAPI)
railway variables --set "PORT=8000"
```

### Step 4: Verify Connection

```bash
# Check all variables
railway variables

# Test database connection (if psql is installed)
railway run psql $DATABASE_URL
```

### Step 5: Initialize Database Schema

**Option A: Via Supabase Dashboard (Easier)**
1. Go to Supabase Dashboard → SQL Editor
2. New Query
3. Paste `backend/schema.sql` content
4. Run

**Option B: Via Railway CLI**
```bash
# Export DATABASE_URL and run schema
railway run bash
export DATABASE_URL=$(railway variables --json | jq -r '.DATABASE_URL')
psql $DATABASE_URL < schema.sql
```

---

## Environment Variables Reference

### For Railway (Backend/FastAPI):

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://postgres:pass@db.xxx.supabase.co:5432/postgres` |
| `OPENAI_API_KEY` | OpenAI API key | `sk-...` |
| `PORT` | Server port | `8000` |
| `SUPABASE_URL` | Supabase project URL (if needed) | `https://xxx.supabase.co` |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (if needed) | `eyJ...` |

### For Vercel/Next.js (Frontend):

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | Railway backend API URL | `https://your-app.railway.app` |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | `https://xxx.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key | `eyJ...` |
| `SUPABASE_URL` | Server-side Supabase URL | `https://xxx.supabase.co` |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-side service role key | `eyJ...` |

---

## Quick Answer to Current Prompt

**If you want to exit and use the dashboard approach:**
1. Press `Esc` (recommended)
2. Or press `Ctrl+C`

**If you want to add PostgreSQL database:**
1. Type: `PostgreSQL` and press Enter
2. Follow the prompts

**If you want to add environment variables:**
1. Type each variable in format: `KEY=VALUE`
2. Press Enter after each
3. Press `Esc` when done

---

## Troubleshooting

### "Cannot redeploy without a snapshot"
- Railway needs a deployment first before setting variables
- Try: `railway up` first, then set variables

### Connection refused
- Check DATABASE_URL is correct
- Verify Supabase project is fully initialized (wait 5-10 min)
- Check firewall/network settings

### Authentication errors
- Verify SUPABASE_SERVICE_ROLE_KEY is correct (not anon key)
- Check key hasn't expired or been rotated

---

## Connect Frontend to Railway Backend

Your frontend uses `lib/api.ts` to make API calls to the Railway backend. You need to configure the Railway backend URL.

### Step 1: Get Railway Backend URL

After deploying your backend to Railway:

1. Go to Railway Dashboard → Your Project → Your Service
2. Click on the service (your FastAPI backend)
3. Go to the **Settings** tab
4. Find **Public Networking** section
5. Click **Generate Domain** (if not already generated)
6. Copy the URL (e.g., `https://your-app-production.up.railway.app`)

### Step 2: Set Frontend Environment Variable

**For Local Development (`.env.local`):**
```bash
NEXT_PUBLIC_API_URL=https://your-app-production.up.railway.app
```

**For Vercel Deployment:**
1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add:
   - **Name**: `NEXT_PUBLIC_API_URL`
   - **Value**: `https://your-app-production.up.railway.app`
   - **Environment**: Production, Preview, Development (select all)

### Step 3: Use in Your Code

Your `lib/api.ts` will automatically use `NEXT_PUBLIC_API_URL`:

```typescript
import { apiFetch } from '@/lib/api';

// Example: Call Railway backend
const data = await apiFetch('/api/opportunities/search?keywords=AI');
```

---

## Next Steps

1. ✅ Exit current Railway prompt (press Esc)
2. ✅ Create/verify Supabase project
3. ✅ Get connection strings and keys
4. ✅ Set Railway variables (backend)
5. ✅ Initialize database schema
6. ✅ Deploy backend: `railway up`
7. ✅ Get Railway backend URL
8. ✅ Set `NEXT_PUBLIC_API_URL` in Vercel/local env
9. ✅ Test connection

Done! 🎉

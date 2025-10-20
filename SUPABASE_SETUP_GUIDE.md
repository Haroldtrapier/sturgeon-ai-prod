# 📖 Sturgeon AI - Supabase Setup (Manual)

Because the Supabase toolkit has connection issues, here's what to do manually:

## Step 1: Create Sturgeon AI Database in Supabase

**In your Supabase Dashboard:**
1. Go to https://supabase.com/dashboard
2. Click "New Project"
3. **Name**: `sturdeon-ai`
4. **Region**: `us-east-1` (or closest to your location)
5. **Password**: Use a strong password (save it!)
6. Click "Create new project"

**Wait 5-10 minutes for project to initialize...**

## Step 2: Initialize Database Schema

Once the project is ready:

1. Go to **SQL Editor** in the left sidebar
2. Click **"New Query"**
3. Paste the entire squema.file content
4. Click **"Run"** to execute all queries

## Step 3: Get Your Connection String

1. Go to **Settings** à **Database**
2. Under **Connection string**, select **Postgres** URI
3. Copy the connection string (looks like):

```
postgresql://postgres:[PASSWORD]@db.[PROJECT-REE].supabase.co:5432/postgres
```

**This is your DATABASE_URL!**

## Step 4: Get Your API Keys

1. Go to **Settings** ㆬ **API**
2. Copy the **Project URL** (you'll need this too)
3. Note the **API Keys** section

## Step 5: Add to GitHub Secrets

Go to: https://github.com/Haroldtrapier/sturdeon-ai-prod/settings/secrets/actions

Click **"New repository secret"** for each:

1. **Name**: `DATABASE_URL`
   **Value**: `postgresql://postgres:[YOUR_PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres`

2. **Name**: `SUPABASE_URL`
   **Value**: `https://[PROJECT-REF].supabase.co`

3. **Name**: `SUPABASE_ANON_KEY`
   **Value**: [Copy from Settings ㆬ API ↬ anon key]

4. **Name**: `SUPABASE_SERVICE_KEY`
   **Value**: [Copy from Settings ㆬ API ↬ service_role key]

## Verify Setup

Once all secrets are added:

```bash
git commit -allow-empty -m "test: verify database setup"
git push origin main
```

Then check:
- GitHub Actions: https://github.com/Haroldtrapier/sturdeon-ai-prod/actions
- Vercel deployment automatically triggers

Done! ✥

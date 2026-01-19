# ⚡ Quick Answer: Railway + Supabase Connection

## 🎯 IMMEDIATE ACTION: What to do in your terminal RIGHT NOW

You're in a `railway add` interactive prompt. Here's what to do:

### Option 1: Exit and Use Dashboard (Recommended - Easier)

**Press `Esc` key** to exit the prompt.

Then:
1. Go to https://railway.app/dashboard
2. Select your project
3. Click "New" → "Variables" to add environment variables manually

---

### Option 2: Add Environment Variables via CLI

If you want to continue in the terminal:

1. **Type each variable in this format:** `KEY=VALUE`
2. **Press Enter after each**
3. **Press `Esc` when finished**

**Example:**
```
? Enter a variable KEY=VALUE, press esc to finish> OPENAI_API_KEY=sk-your-key-here
? Enter a variable KEY=VALUE, press esc to finish> PORT=8000
? Enter a variable KEY=VALUE, press esc to finish> [Press Esc]
```

---

## 🚀 Recommended Setup Steps

### Step 1: Exit Current Prompt
**Press `Esc`** (or `Ctrl+C`)

### Step 2: Get Supabase Credentials

1. Go to https://supabase.com/dashboard
2. Select your project (or create one: "sturgeon-ai")
3. Go to **Settings → Database**
   - Copy **Connection string** (URI format)
4. Go to **Settings → API**
   - Copy **Project URL**
   - Copy **anon key**
   - Copy **service_role key**

### Step 3: Set Railway Variables

```bash
# Make sure you're in the backend directory
cd backend

# Database connection (from Supabase)
railway variables --set "DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres"

# API keys
railway variables --set "OPENAI_API_KEY=your-openai-key-here"

# Port
railway variables --set "PORT=8000"
```

### Step 4: Verify

```bash
railway variables
```

---

## 📋 Complete Variable List for Railway (Backend)

Replace `[YOUR-VALUES]` with actual values from Supabase:

```bash
railway variables --set "DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres"
railway variables --set "OPENAI_API_KEY=[YOUR-OPENAI-KEY]"
railway variables --set "PORT=8000"
```

## 📋 Complete Variable List for Vercel (Frontend)

After deploying Railway backend, get the URL and set in Vercel:

1. **Railway Dashboard** → Your Service → Settings → Copy Public Domain
2. **Vercel Dashboard** → Settings → Environment Variables → Add:
   - `NEXT_PUBLIC_API_URL` = `https://your-app.railway.app`
   - `NEXT_PUBLIC_SUPABASE_URL` = `https://xxx.supabase.co`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = `your_anon_key`

---

## ⚠️ Important Notes

- **Don't use Railway's PostgreSQL** if you're using Supabase (you already have PostgreSQL in Supabase)
- The `railway add` command is for adding services (like PostgreSQL), not variables
- Use `railway variables --set` for environment variables
- If you get "Cannot redeploy without a snapshot", deploy first: `railway up`

---

**TL;DR: Press `Esc` to exit, then use `railway variables --set "KEY=VALUE"` for each variable.**

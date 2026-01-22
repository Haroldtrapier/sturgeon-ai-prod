# 🚂 RAILWAY BACKEND FIX - Complete Guide

**Status:** Railway URL exists but returns 404 → Backend was configured but NEVER deployed!

---

## 🔍 ISSUE DIAGNOSED

```bash
✅ Railway URL: https://acceptable-beauty.up.railway.app
✅ DNS resolves correctly
❌ Returns 404 (No app running)

✅ backend/railway.toml: Correct
✅ backend/Procfile: Correct  
✅ backend/requirements.txt: Has all dependencies
✅ backend/main.py: Has /health endpoint
```

**Root Cause:** Railway project exists but backend code was never deployed!

---

## ✅ SOLUTION 1: Deploy via Railway Dashboard (Easiest - 5 minutes)

### Step 1: Login to Railway
1. Go to https://railway.app
2. Click "Login" (top right)
3. Login with GitHub

### Step 2: Find Your Project
1. Look for a project named something like:
   - "sturgeon-ai-prod"
   - "acceptable-beauty"
   - Or check all projects for the URL `acceptable-beauty.up.railway.app`

### Step 3: Connect to GitHub Repo
1. Click on the project
2. Click "Settings" → "Source"
3. If not connected, click "Connect Repo"
4. Select: `Haroldtrapier/sturgeon-ai-prod`
5. **CRITICAL:** Set Root Directory to: `backend`
6. Set Branch: `main`
7. Click "Save"

### Step 4: Set Environment Variables
1. Click "Variables" tab
2. Add these variables:
   ```
   OPENAI_API_KEY=your-actual-openai-key
   CORS_ORIGINS=https://sturgeon-ai-prod-1.vercel.app
   PORT=8000
   ```
3. Click "Save"

### Step 5: Trigger Deployment
1. Go to "Deployments" tab
2. Click "Deploy" button
3. Or push a new commit to main branch
4. Watch the build logs

### Step 6: Verify
1. Wait for "Deployed" status (green checkmark)
2. Test: https://acceptable-beauty.up.railway.app/health
3. Should see:
   ```json
   {
     "ok": true,
     "service": "sturgeon-ai-backend",
     "version": "1.0.0"
   }
   ```

---

## ✅ SOLUTION 2: Deploy via Railway CLI (Advanced - 10 minutes)

### Step 1: Install Railway CLI
```bash
# macOS
brew install railway

# Linux/WSL
npm install -g @railway/cli
# OR
sh <(curl -sSL https://raw.githubusercontent.com/railwayapp/cli/master/install.sh)

# Windows (PowerShell)
iwr https://railway.app/install.ps1 | iex
```

### Step 2: Login
```bash
railway login
# This will open a browser window - approve the login
```

### Step 3: Link Existing Project
```bash
cd /path/to/sturgeon-ai-prod/backend
railway link
# Select your existing project from the list
# Look for "acceptable-beauty" or similar
```

### Step 4: Set Environment Variables
```bash
railway variables set OPENAI_API_KEY="your-key"
railway variables set CORS_ORIGINS="https://sturgeon-ai-prod-1.vercel.app"
railway variables set PORT="8000"
```

### Step 5: Deploy
```bash
# From backend/ directory
railway up

# Watch logs
railway logs
```

### Step 6: Verify
```bash
curl https://acceptable-beauty.up.railway.app/health
```

---

## ✅ SOLUTION 3: Create NEW Railway Project (If Existing is Broken)

### Via Dashboard
1. Go to https://railway.app/new
2. Click "Deploy from GitHub repo"
3. Select: `Haroldtrapier/sturgeon-ai-prod`
4. **Root Directory:** `backend`
5. Add environment variables:
   ```
   OPENAI_API_KEY=your-key
   CORS_ORIGINS=https://sturgeon-ai-prod-1.vercel.app
   ```
6. Click "Deploy"
7. Copy the new Railway URL
8. Update Vercel environment variable:
   - Go to https://vercel.com/haroldtrapier/sturgeon-ai-prod-1/settings/environment-variables
   - Update `BACKEND_URL` to new Railway URL

---

## 🎯 AFTER DEPLOYMENT: Update Vercel

### Option A: If You Kept Same URL
No changes needed! Your app will automatically start working.

### Option B: If You Got New Railway URL
1. Go to Vercel: https://vercel.com/haroldtrapier/sturgeon-ai-prod-1
2. Settings → Environment Variables
3. Update `BACKEND_URL` to your new Railway URL
4. Redeploy frontend

---

## 🧪 TESTING AFTER DEPLOYMENT

### Test 1: Health Check
```bash
curl https://acceptable-beauty.up.railway.app/health
```
Expected:
```json
{"ok": true, "service": "sturgeon-ai-backend", "version": "1.0.0"}
```

### Test 2: AI Chat Endpoint
```bash
curl -X POST https://acceptable-beauty.up.railway.app/agent/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello", "userId": "test"}'
```

### Test 3: From Frontend
1. Go to https://sturgeon-ai-prod-1.vercel.app
2. Login
3. Click "AI Agent" in sidebar
4. Send a message
5. Should get response (not "Backend unavailable" error)

---

## 🔧 TROUBLESHOOTING

### Error: "ModuleNotFoundError"
**Cause:** Missing dependencies  
**Fix:** Check railway.toml has correct start command
```toml
[deploy]
startCommand = "uvicorn main:app --host 0.0.0.0 --port 8000"
```

### Error: "Address already in use"
**Cause:** Wrong PORT binding  
**Fix:** Railway provides PORT env var automatically
```python
# In main.py, use:
port = int(os.getenv("PORT", 8000))
uvicorn.run(app, host="0.0.0.0", port=port)
```

### Error: "CORS policy" in browser
**Cause:** Missing CORS origin  
**Fix:** Set CORS_ORIGINS env var in Railway:
```
CORS_ORIGINS=https://sturgeon-ai-prod-1.vercel.app,http://localhost:3000
```

### Error: "Build failed"
**Cause:** Wrong root directory  
**Fix:** In Railway Settings → Source → Root Directory: `backend`

### Error: "Connection timeout"
**Cause:** Railway service sleeping  
**Fix:** 
- Free plan: Services sleep after 5 min inactivity
- First request wakes it up (takes ~30s)
- Upgrade to Hobby plan ($5/mo) for always-on

---

## 📊 WHAT CHANGED

| Component | Before | After |
|-----------|--------|-------|
| Railway URL | 404 Error | ✅ Working |
| Backend Status | Not Deployed | ✅ Running |
| AI Chat | Broken | ✅ Functional |
| Health Check | Failed | ✅ Returns 200 |
| Vercel Frontend | Partial | ✅ Complete |

---

## 🎉 SUCCESS CHECKLIST

- [ ] Railway shows "Deployed" status (green)
- [ ] `/health` endpoint returns 200
- [ ] AI chat endpoint responds  
- [ ] Frontend can connect to backend
- [ ] No CORS errors in browser console
- [ ] Environment variables are set

---

## 🆘 STILL NOT WORKING?

### Quick Debug
```bash
# Check Railway logs
railway logs

# Test health endpoint
curl -v https://acceptable-beauty.up.railway.app/health

# Check environment variables
railway variables
```

### Common Issues:
1. **Forgot to set ROOT DIRECTORY to `backend`** ← Most common!
2. Missing OPENAI_API_KEY
3. Wrong CORS_ORIGINS
4. Railway free plan sleeping (upgrade to $5 Hobby plan)

---

## 📝 NEXT STEPS AFTER FIX

1. ✅ Test all marketplace imports
2. ✅ Test AI agent chat
3. ✅ Create opportunities and proposals
4. ✅ Verify RLS works (users see only their data)
5. ✅ Deploy to production

---

**Need help?** 
- Railway Docs: https://docs.railway.app
- Railway Discord: https://discord.gg/railway
- This guide: `RAILWAY_BACKEND_FIX.md`

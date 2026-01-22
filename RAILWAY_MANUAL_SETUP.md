# 🚂 RAILWAY MANUAL SETUP - Step by Step

**Since Railway doesn't have a public API, you need to set this up manually once. After that, GitHub Actions will auto-deploy!**

---

## 📋 PREREQUISITES

You need:
1. Railway account (https://railway.app)
2. Your Railway project (the one with URL: https://acceptable-beauty.up.railway.app)

---

## ⚡ QUICK FIX (5 Minutes)

### Step 1: Login to Railway
1. Go to: https://railway.app
2. Click **Login** (top right)
3. Login with GitHub

### Step 2: Find Your Project
1. Look for project with domain: `acceptable-beauty.up.railway.app`
2. Click on it

### Step 3: Configure Source (CRITICAL)
1. Click **Settings** (left sidebar)
2. Scroll to **Source** section
3. Click **Connect Repo**
4. Select: `Haroldtrapier/sturgeon-ai-prod`
5. **⚠️ CRITICAL:** Set **Root Directory**: `backend`
6. Branch: `main`
7. Click **Save**

### Step 4: Set Environment Variables
1. Click **Variables** tab (left sidebar)
2. Click **+ New Variable**
3. Add these:

```bash
OPENAI_API_KEY=your-actual-openai-api-key-here
CORS_ORIGINS=https://sturgeon-ai-prod-1.vercel.app,http://localhost:3000
PORT=8000
PYTHON_VERSION=3.11
```

4. Click **Save** for each

### Step 5: Deploy!
1. Railway will automatically deploy when you save the Source settings
2. OR click **Deployments** → **Deploy**
3. Watch the logs in real-time

### Step 6: Verify
```bash
# Wait 2-3 minutes, then test:
curl https://acceptable-beauty.up.railway.app/health
```

**Expected Response:**
```json
{"ok": true, "service": "sturgeon-ai-backend", "version": "1.0.0"}
```

✅ **Done!** Your backend is now live!

---

## 🔄 ENABLE AUTO-DEPLOY (Optional but Recommended)

To enable GitHub Actions to auto-deploy future changes:

### Get Railway Token
1. In Railway dashboard, click your **profile** (top right)
2. Go to **Account Settings**
3. Scroll to **Tokens**
4. Click **Create Token**
5. Name it: `github-actions`
6. Copy the token (starts with `railway_...`)

### Add to GitHub Secrets
1. Go to: https://github.com/Haroldtrapier/sturgeon-ai-prod/settings/secrets/actions
2. Click **New repository secret**
3. Name: `RAILWAY_TOKEN`
4. Value: Paste your Railway token
5. Click **Add secret**

### Get Railway Project ID
1. In Railway project, click **Settings**
2. Scroll to **Project ID**
3. Copy the ID (e.g., `prod-abc123`)
4. Add to GitHub Secrets:
   - Name: `RAILWAY_PROJECT_ID`
   - Value: Your project ID

✅ **Now every push to `main` with backend changes will auto-deploy!**

---

## 🧪 TESTING

### Test Health Endpoint
```bash
curl https://acceptable-beauty.up.railway.app/health
```

### Test AI Chat
```bash
curl -X POST https://acceptable-beauty.up.railway.app/agent/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "test", "userId": "test"}'
```

### Test from Frontend
1. Go to: https://sturgeon-ai-prod-1.vercel.app
2. Login
3. Click **AI Agent**
4. Send a message
5. Should get response!

---

## 🐛 TROUBLESHOOTING

### Issue: "Build Failed"
**Solution:** Check Root Directory is set to `backend`

### Issue: "Module not found"
**Solution:** Check requirements.txt exists in backend/

### Issue: "Port already in use"
**Solution:** Make sure start command uses `$PORT` variable:
```bash
uvicorn main:app --host 0.0.0.0 --port $PORT
```

### Issue: "CORS error" in browser
**Solution:** Check CORS_ORIGINS includes your Vercel domain

### Issue: "Health check failing"
**Solution:** Check /health endpoint exists in main.py

### Issue: "Railway sleeping" (504 errors)
**Cause:** Free plan sleeps after 5 min inactivity
**Solution:** 
- First request wakes it (30s delay)
- Or upgrade to Hobby plan ($5/mo) for always-on

---

## 📊 DEPLOYMENT STATUS

After setup, verify everything:

- [ ] Railway shows "Deployed" (green)
- [ ] Health endpoint returns 200 OK
- [ ] AI chat endpoint responds
- [ ] Frontend connects successfully
- [ ] No CORS errors
- [ ] GitHub Actions workflow (optional)

---

## 🎯 WHAT'S NEXT?

Once Railway is deployed:
1. ✅ Test all marketplace imports
2. ✅ Test AI chat functionality
3. ✅ Create test opportunities
4. ✅ Generate test proposals
5. ✅ Verify RLS security
6. ✅ Launch to production!

---

## 💡 RAILWAY DASHBOARD QUICK LINKS

- **Project:** https://railway.app/project/[your-project-id]
- **Deployments:** https://railway.app/project/[your-project-id]/deployments
- **Variables:** https://railway.app/project/[your-project-id]/variables
- **Logs:** https://railway.app/project/[your-project-id]/logs
- **Settings:** https://railway.app/project/[your-project-id]/settings

---

## 📞 NEED HELP?

Stuck? Share:
1. Railway deployment logs
2. Any error messages
3. Screenshot of Settings → Source

I'll help debug!

---

**Remember:** The most common issue is forgetting to set **Root Directory** to `backend`! ⚠️

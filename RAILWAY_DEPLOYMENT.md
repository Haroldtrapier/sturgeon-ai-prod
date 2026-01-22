# 🚂 Railway Backend Deployment Guide

## Prerequisites

- Railway account (https://railway.app)
- GitHub repo access
- OpenAI API key (for AI features)

---

## Method 1: Deploy from GitHub (Recommended)

### Step 1: Create New Project

1. Go to https://railway.app/new
2. Click **"Deploy from GitHub repo"**
3. Select **`Haroldtrapier/sturgeon-ai-prod`**
4. Click **"Deploy Now"**

### Step 2: Configure Build Settings

1. In Railway dashboard, click your service
2. Go to **Settings** tab
3. Set **Root Directory**: `backend`
4. Set **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`

### Step 3: Add Environment Variables

In **Variables** tab, add:

```env
OPENAI_API_KEY=sk-proj-your-key-here
CORS_ORIGINS=https://sturgeon-ai-prod-1.vercel.app,https://sturgeon-ai-prod-1-info-58560041s-projects.vercel.app
PORT=8000
```

### Step 4: Deploy

1. Click **"Deploy"** or wait for auto-deploy
2. Wait for build to complete (2-3 minutes)
3. Copy the **Railway URL** (e.g., `https://acceptable-beauty.up.railway.app`)

### Step 5: Update Vercel

1. Go to Vercel project settings
2. Add environment variable:
   ```
   BACKEND_URL=https://your-app.railway.app
   ```
3. Redeploy Vercel (Settings → Deployments → Redeploy)

---

## Method 2: Deploy via Railway CLI

### Step 1: Install Railway CLI

```bash
npm i -g @railway/cli
```

### Step 2: Login

```bash
railway login
```

### Step 3: Initialize Project

```bash
cd backend
railway init
```

### Step 4: Set Environment Variables

```bash
railway variables set OPENAI_API_KEY=sk-proj-your-key
railway variables set CORS_ORIGINS=https://sturgeon-ai-prod-1.vercel.app
railway variables set PORT=8000
```

### Step 5: Deploy

```bash
railway up
```

---

## Method 3: Deploy from Local (Docker)

### Create Dockerfile

Create `backend/Dockerfile`:

```dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

Then deploy to Railway with Docker.

---

## 🧪 Verify Deployment

### Test Health Endpoint

```bash
curl https://your-app.railway.app/health
```

**Expected response:**
```json
{
  "ok": true,
  "service": "sturgeon-ai-backend",
  "version": "1.0.0",
  "env": {
    "hasOpenAI": true,
    "corsOrigins": ["https://sturgeon-ai-prod-1.vercel.app"]
  }
}
```

### Test Agent Endpoint

```bash
curl -X POST https://your-app.railway.app/agent/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello", "context": {}}'
```

### Test from Vercel

Once Vercel has `BACKEND_URL` set, test the AI agent page:
1. Go to https://sturgeon-ai-prod-1.vercel.app/agent
2. Send a message
3. Should get response from backend

---

## 🐛 Troubleshooting

### "Application not found" (404)

**Cause:** Railway app not deployed or wrong URL

**Fix:**
1. Check Railway dashboard - is service running?
2. Look for deployment logs
3. Verify URL in Railway settings
4. Check if service crashed (look for error logs)

### Build Fails

**Cause:** Missing dependencies or wrong Python version

**Fix:**
1. Ensure `requirements.txt` is complete
2. Set Python version in Railway: Settings → Build → Python 3.11
3. Check build logs for specific error

### CORS Errors

**Cause:** Frontend domain not in CORS_ORIGINS

**Fix:**
1. Update `CORS_ORIGINS` variable in Railway
2. Include all Vercel domains (production + preview)
3. Redeploy backend

### AI Not Responding

**Cause:** OpenAI API key missing or invalid

**Fix:**
1. Verify `OPENAI_API_KEY` in Railway variables
2. Check OpenAI dashboard for key validity
3. Check Railway logs for API errors

---

## 📊 Required Environment Variables

### Railway Backend (REQUIRED)

| Variable | Description | Example |
|----------|-------------|----------|
| `OPENAI_API_KEY` | OpenAI API key for AI chat | `sk-proj-...` |
| `CORS_ORIGINS` | Allowed frontend domains | `https://sturgeon-ai-prod-1.vercel.app` |
| `PORT` | Port for Railway (auto-set) | `8000` |

### Railway Backend (OPTIONAL)

| Variable | Description | Example |
|----------|-------------|----------|
| `DATABASE_URL` | If backend needs direct DB access | `postgresql://...` |
| `ANTHROPIC_API_KEY` | If using Claude instead | `sk-ant-...` |

---

## 🔍 Health Checklist

After deployment, verify:

- [ ] Railway shows "Active" status
- [ ] `/health` endpoint returns 200
- [ ] Logs show "Application startup complete"
- [ ] CORS headers include your Vercel domain
- [ ] No error logs in Railway dashboard
- [ ] Vercel can reach backend (test from AI agent page)

---

## 📞 Railway Support Resources

- Dashboard: https://railway.app/dashboard
- Docs: https://docs.railway.app
- Discord: https://discord.gg/railway
- Status: https://status.railway.app

---

## 🔄 Redeploying After Changes

### Automatic
Push to GitHub → Railway auto-deploys

### Manual
```bash
railway up
```

### Force Redeploy
Railway Dashboard → Service → Deployments → Redeploy

---

## ✅ Success Criteria

Your backend is working when:
1. ✅ Health endpoint returns JSON with `ok: true`
2. ✅ No 404 errors
3. ✅ Logs show FastAPI startup
4. ✅ AI agent chat works from Vercel
5. ✅ CORS allows requests from your domain

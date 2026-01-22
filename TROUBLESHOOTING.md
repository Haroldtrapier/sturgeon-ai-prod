# 🔧 Sturgeon AI - Quick Fix Guide

## Issue: Railway Backend Returns 404

### Current Status
`https://acceptable-beauty.up.railway.app` returns:
```json
{"status":"error","code":404,"message":"Application not found"}
```

### Root Cause
The Railway service is either:
1. Not deployed
2. Stopped/crashed
3. Wrong URL
4. Build failed

### Fix Steps

#### 1. Check Railway Dashboard

1. Go to https://railway.app/dashboard
2. Find your project
3. Check service status:
   - 🟢 **Active** = good
   - 🔴 **Crashed** = needs restart
   - ⚪ **Stopped** = needs deploy

#### 2. Check Deployment Logs

1. Click service
2. Go to **Deployments** tab
3. Click latest deployment
4. Check logs for errors

**Look for:**
- ❌ Import errors (missing dependencies)
- ❌ Port binding errors
- ❌ Environment variable errors

#### 3. Verify Build Configuration

In Railway Settings:
- **Root Directory**: `backend` ✅
- **Build Command**: (auto-detected) ✅
- **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT` ✅

#### 4. Check Environment Variables

Required:
- `OPENAI_API_KEY` ✅
- `CORS_ORIGINS` ✅

Optional:
- `PORT` (Railway sets automatically)

#### 5. Force Redeploy

```bash
# Option A: Via Dashboard
Railway → Service → Deployments → "Redeploy"

# Option B: Via CLI
cd backend
railway up --service backend
```

---

## Issue: Database Migration Not Applied

### Symptoms
- API returns "column does not exist" errors
- Can't save opportunities
- RLS errors

### Fix

1. Go to Supabase SQL Editor
2. Run: `supabase/migrations/002_add_user_id_and_rls.sql`
3. Verify:
   ```sql
   SELECT column_name FROM information_schema.columns 
   WHERE table_name = 'opportunities' AND column_name = 'user_id';
   ```
4. Should return `user_id` row

---

## Issue: API Import Fails

### Symptoms
- Import button doesn't work
- Error: "Unauthorized"
- Error: "Failed to save"

### Fix

#### Check Authentication
1. Open browser console
2. Go to Application → Cookies
3. Verify Supabase auth cookies exist
4. Try logging out and back in

#### Check Network Tab
1. Open DevTools → Network
2. Click "Save to Sturgeon AI"
3. Check `/api/opportunities/import` request
4. Look at response for specific error

#### Check Supabase RLS
```sql
-- Temporarily disable RLS for testing
ALTER TABLE public.opportunities DISABLE ROW LEVEL SECURITY;

-- Try import again
-- If it works, RLS policy issue

-- Re-enable after testing
ALTER TABLE public.opportunities ENABLE ROW LEVEL SECURITY;
```

---

## Issue: AI Agent Not Responding

### Symptoms
- Send message, no response
- Error in console
- "Thinking..." never completes

### Fix

#### 1. Check Backend URL
In Vercel environment variables, verify:
```
BACKEND_URL=https://acceptable-beauty.up.railway.app
```

#### 2. Check CORS
Backend logs should show:
```
INFO:     127.0.0.1:xxxx - "POST /agent/chat HTTP/1.1" 200 OK
```

Not:
```
CORS error: Origin not allowed
```

#### 3. Test Backend Directly
```bash
curl -X POST https://acceptable-beauty.up.railway.app/agent/chat \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer test-user-id" \
  -d '{"message": "test"}'
```

---

## Issue: Vercel Build Fails

### Symptoms
- Deployment shows ERROR state
- "npm run build" failed

### Fix

#### Check Build Logs
1. Vercel → Deployments → Click failed deployment
2. Look for specific error

#### Common Issues
- **"Module not found"**: Check imports and file paths
- **"Type error"**: Run `npm run type-check` locally
- **"NEXT_RSC_ERR"**: Missing `'use client'` directive

---

## 🆘 Emergency Contacts

- **Vercel Support**: https://vercel.com/support
- **Railway Support**: https://railway.app/help
- **Supabase Support**: https://supabase.com/support

---

## ✅ When Everything Works

You should be able to:
1. ✅ Sign up / Log in
2. ✅ Visit any marketplace page
3. ✅ Import an opportunity (paste URL or text)
4. ✅ See "Saved successfully" message
5. ✅ Go to AI Agent page
6. ✅ Send message and get response
7. ✅ View saved opportunities list

If all 7 work → **You're production ready!** 🎉

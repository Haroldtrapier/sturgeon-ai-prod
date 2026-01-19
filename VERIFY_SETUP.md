# ✅ Verify Your Railway + Supabase Setup

## Quick Verification Checklist

Use this guide to verify you have everything configured correctly.

---

## 1. Verify Supabase Setup

### Check if you have Supabase project:

1. **Go to Supabase Dashboard**
   - https://supabase.com/dashboard
   - Do you see a project named `sturgeon-ai` or similar?

2. **Get Your Credentials** (if you have a project):
   - Go to **Settings → API**
   - You need:
     - ✅ **Project URL**: `https://xxxxx.supabase.co`
     - ✅ **anon public key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
     - ✅ **service_role key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (keep secret!)

3. **Get Database Connection String**:
   - Go to **Settings → Database**
   - Under **Connection string**, select **URI** tab
   - Copy: `postgresql://postgres:[PASSWORD]@db.xxxxx.supabase.co:5432/postgres`

### If you DON'T have a Supabase project:
- Follow `SUPABASE_SETUP_GUIDE.md` to create one
- Or use the quick setup in `RAILWAY_SUPABASE_CONNECTION_GUIDE.md`

---

## 2. Verify Railway Setup

### Check if you have Railway backend deployed:

1. **Go to Railway Dashboard**
   - https://railway.app/dashboard
   - Do you see a project with your backend service?

2. **Get Your Railway Backend URL**:
   - Click on your project → Your service
   - Go to **Settings → Public Networking**
   - If no domain exists, click **Generate Domain**
   - Copy the URL: `https://xxxxx-production.up.railway.app`

3. **Test Your Railway Backend**:
   ```bash
   # Replace with your actual Railway URL
   curl https://your-app.railway.app/health
   ```
   Should return: `{"status":"healthy","timestamp":"..."}`

4. **Check Railway Environment Variables**:
   ```bash
   cd backend
   railway variables
   ```
   You should see:
   - ✅ `DATABASE_URL` (from Supabase)
   - ✅ `OPENAI_API_KEY` (optional)
   - ✅ `PORT=8000`

### If you DON'T have Railway backend deployed:
- Follow `RAILWAY_SUPABASE_CONNECTION_GUIDE.md`
- Or use the quick setup in `QUICK_ANSWER.md`

---

## 3. Verify Vercel Environment Variables

### Check what's currently set in Vercel:

1. **Go to Vercel Dashboard**
   - https://vercel.com/dashboard
   - Select your project: `sturgeon-ai-prod`

2. **Check Environment Variables**:
   - Go to **Settings → Environment Variables**
   - Verify you have:

   **Required:**
   - ✅ `NEXT_PUBLIC_SUPABASE_URL`
   - ✅ `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - ✅ `SUPABASE_URL`
   - ✅ `SUPABASE_SERVICE_ROLE_KEY`
   - ✅ `NEXT_PUBLIC_API_URL` (Railway backend URL)

   **Optional:**
   - `OPENAI_API_KEY`
   - `ANTHROPIC_API_KEY`

3. **If any are missing:**
   - Add them using the values from steps 1 and 2 above
   - Make sure to enable for **Production**, **Preview**, and **Development**
   - Redeploy after adding

---

## 4. Quick Test Commands

### Test Supabase Connection:
```bash
# Test if Supabase credentials work
node -e "
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);
supabase.auth.getUser().then(console.log).catch(console.error);
"
```

### Test Railway Backend:
```bash
# Test Railway backend health
curl https://your-railway-url.railway.app/health
```

### Test Local Environment:
```bash
# Check if .env.local has the required vars
cat .env.local | grep -E "SUPABASE|API_URL"
```

---

## 5. Architecture Summary

Your setup should look like this:

```
┌─────────────────────────────────────────────────────────┐
│                    Vercel (Frontend)                     │
│  Next.js App - Needs these env vars:                    │
│  • NEXT_PUBLIC_SUPABASE_URL                             │
│  • NEXT_PUBLIC_SUPABASE_ANON_KEY                         │
│  • NEXT_PUBLIC_API_URL (Railway URL)                     │
│  • SUPABASE_URL (for API routes)                         │
│  • SUPABASE_SERVICE_ROLE_KEY (for API routes)            │
└──────────────┬──────────────────────────┬─────────────┘
               │                            │
               │ API Calls                  │ Auth
               │                            │
       ┌───────▼────────┐          ┌───────▼────────┐
       │  Railway       │          │  Supabase      │
       │  (Backend)     │          │  (Database +   │
       │                │          │   Auth)        │
       │  Needs:        │          │                │
       │  • DATABASE_URL│◄─────────┤  PostgreSQL    │
       │  • OPENAI_KEY  │          │  Auth Service  │
       │  • PORT        │          │                │
       └────────────────┘          └────────────────┘
```

---

## 6. Common Issues & Solutions

### Issue: "Missing required env var: NEXT_PUBLIC_API_URL"
**Solution:** Add `NEXT_PUBLIC_API_URL` in Vercel with your Railway backend URL

### Issue: "Cannot read property 'supabase' of undefined"
**Solution:** Add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` in Vercel

### Issue: "500 Internal Server Error" on API routes
**Solution:** Add `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` in Vercel

### Issue: Railway backend not responding
**Solution:** 
- Check Railway dashboard for service status
- Verify `PORT=8000` is set in Railway variables
- Check Railway logs for errors

### Issue: Database connection errors
**Solution:**
- Verify `DATABASE_URL` in Railway matches Supabase connection string
- Check Supabase project is active
- Verify database password is correct

---

## 7. Next Steps

Once you've verified everything:

1. ✅ **All environment variables set in Vercel**
2. ✅ **Railway backend is deployed and accessible**
3. ✅ **Supabase project is active**
4. ✅ **Redeploy Vercel** (to pick up new env vars)
5. ✅ **Test the deployed app**

---

## Quick Reference

### Where to find credentials:

**Supabase:**
- Dashboard: https://supabase.com/dashboard
- Settings → API (for keys)
- Settings → Database (for connection string)

**Railway:**
- Dashboard: https://railway.app/dashboard
- Your Service → Settings → Public Networking (for URL)
- Your Service → Variables (for env vars)

**Vercel:**
- Dashboard: https://vercel.com/dashboard
- Your Project → Settings → Environment Variables

---

**Both Railway and Supabase are needed and work together!** 🚀

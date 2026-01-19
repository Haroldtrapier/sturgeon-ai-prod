# ⚡ Quick Verification - Do You Have Everything?

## 30-Second Check

### ✅ Check 1: Do you have a Supabase project?
- Go to: https://supabase.com/dashboard
- Do you see a project? → **YES** = ✅ | **NO** = Create one

### ✅ Check 2: Do you have Railway backend deployed?
- Go to: https://railway.app/dashboard  
- Do you see a deployed service? → **YES** = ✅ | **NO** = Deploy it

### ✅ Check 3: Are Vercel env vars set?
- Go to: https://vercel.com/dashboard → Your Project → Settings → Environment Variables
- Do you see these 5 variables?
  - `NEXT_PUBLIC_SUPABASE_URL` ✅
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY` ✅
  - `SUPABASE_URL` ✅
  - `SUPABASE_SERVICE_ROLE_KEY` ✅
  - `NEXT_PUBLIC_API_URL` ✅

---

## If You Have Everything ✅

Great! Just make sure:

1. **Vercel has all 5 environment variables** (see Check 3 above)
2. **Railway backend is running** (check Railway dashboard)
3. **Redeploy Vercel** after adding any new env vars

The build should work now that we fixed the code issues!

---

## If You're Missing Something

### Missing Supabase?
- Follow: `SUPABASE_SETUP_GUIDE.md`
- Or: `RAILWAY_SUPABASE_CONNECTION_GUIDE.md` (Part 1)

### Missing Railway?
- Follow: `RAILWAY_SUPABASE_CONNECTION_GUIDE.md` (Part 2)
- Or: `QUICK_ANSWER.md`

### Missing Vercel env vars?
- Follow: `VERCEL_ENV_SETUP.md`
- Add the variables from your Supabase and Railway dashboards

---

## Quick Test

Once everything is set up, test:

1. **Railway backend:**
   ```bash
   curl https://your-railway-url.railway.app/health
   ```
   Should return: `{"status":"healthy"}`

2. **Vercel deployment:**
   - Visit your Vercel URL
   - Try to login (tests Supabase)
   - Try `/opportunities` page (tests Railway API)

---

**Both Railway and Supabase are needed - they work together!** 🚀

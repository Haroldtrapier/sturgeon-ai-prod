# 🔧 Vercel Environment Variables Setup

## Critical Issue

Even if the build succeeds, **missing environment variables in Vercel will cause runtime errors**. Your app needs:

1. **Supabase credentials** (for authentication)
2. **Railway backend URL** (for API calls)

---

## Required Environment Variables for Vercel

### 1. Supabase Configuration (REQUIRED)

Go to **Vercel Dashboard → Your Project → Settings → Environment Variables**

Add these:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Where to get these:**
1. Go to https://supabase.com/dashboard
2. Select your project
3. Go to **Settings → API**
4. Copy:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_URL`
   - **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role** key → `SUPABASE_SERVICE_ROLE_KEY` (⚠️ Keep secret!)

### 2. Railway Backend URL (REQUIRED)

```env
NEXT_PUBLIC_API_URL=https://your-app-production.up.railway.app
```

**Where to get this:**
1. Go to https://railway.app/dashboard
2. Select your project → Your service
3. Go to **Settings → Public Networking**
4. Generate domain if needed
5. Copy the URL (e.g., `https://sturgeon-ai-production.up.railway.app`)

### 3. Optional API Keys

```env
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
```

---

## How to Add in Vercel

1. **Go to Vercel Dashboard**
   - https://vercel.com/dashboard
   - Select your project: `sturgeon-ai-prod`

2. **Navigate to Settings**
   - Click on your project
   - Click **Settings** tab
   - Click **Environment Variables** in the sidebar

3. **Add Each Variable**
   - Click **Add New**
   - Enter **Name** (e.g., `NEXT_PUBLIC_SUPABASE_URL`)
   - Enter **Value** (paste your actual value)
   - Select environments: **Production**, **Preview**, **Development** (select all)
   - Click **Save**

4. **Repeat for all variables** listed above

5. **Redeploy**
   - After adding variables, go to **Deployments** tab
   - Click the **⋯** menu on the latest deployment
   - Click **Redeploy**
   - Or push a new commit to trigger auto-deploy

---

## Verification Checklist

After adding variables, verify:

- [ ] `NEXT_PUBLIC_SUPABASE_URL` is set
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` is set
- [ ] `SUPABASE_URL` is set (same as NEXT_PUBLIC_SUPABASE_URL)
- [ ] `SUPABASE_SERVICE_ROLE_KEY` is set
- [ ] `NEXT_PUBLIC_API_URL` is set (Railway backend URL)
- [ ] All variables are enabled for **Production**, **Preview**, and **Development**

---

## Current Code Dependencies

### Files that need Supabase env vars:

1. **`app/opportunities/page.tsx`**
   ```typescript
   const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
   const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
   ```
   - ❌ **Will fail at runtime** if not set

2. **`app/profile/page.tsx`**
   ```typescript
   const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
   const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
   ```
   - ❌ **Will fail at runtime** if not set

3. **`lib/api.ts`**
   ```typescript
   export function requireApiUrl() {
     assertEnv("NEXT_PUBLIC_API_URL", API_URL);
     return API_URL;
   }
   ```
   - ❌ **Will throw error** when `apiFetch()` is called if `NEXT_PUBLIC_API_URL` is not set

4. **`middleware.ts`**
   - Uses `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - Has fallback (won't crash, but auth won't work)

5. **API Routes** (`pages/api/auth/*`)
   - Use `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`
   - Will return 500 errors if not set

---

## Testing After Setup

1. **Check Build Logs**
   - Build should succeed (we fixed the code issues)
   - Look for any warnings about missing env vars

2. **Test Runtime**
   - Visit your deployed site
   - Try to login → Should work if Supabase vars are set
   - Try to access `/opportunities` → Should work if Railway URL is set
   - Check browser console for errors

3. **Common Runtime Errors**

   **"Missing required env var: NEXT_PUBLIC_API_URL"**
   - ✅ Add `NEXT_PUBLIC_API_URL` in Vercel
   - ✅ Set it to your Railway backend URL

   **"Cannot read property 'supabase' of undefined"**
   - ✅ Add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`

   **"500 Internal Server Error" on `/api/auth/login`**
   - ✅ Add `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`

---

## Quick Setup Commands

If you have Railway CLI and Supabase CLI, you can verify:

```bash
# Check Railway variables
railway variables

# Check if Railway service is running
railway status

# Test Railway backend
curl https://your-app.railway.app/health
```

---

## Next Steps

1. ✅ **Add all environment variables in Vercel** (see above)
2. ✅ **Redeploy** your Vercel project
3. ✅ **Test** the deployed site
4. ✅ **Check logs** if anything fails

---

**The build errors we fixed were code issues. But yes, Railway and Supabase env vars are critical for the app to actually work!** 🚀

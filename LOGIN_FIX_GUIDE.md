# Sturgeon AI Login Fix Guide

## Problem Identified ❌

The login system is **failing because Supabase environment variables are missing** from `.env.local`.

### Current Issues:

1. **Missing Supabase Environment Variables**
   - `NEXT_PUBLIC_SUPABASE_URL` - Not configured
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Not configured  
   - `SUPABASE_URL` - Not configured
   - `SUPABASE_SERVICE_ROLE_KEY` - Not configured

2. **Current `.env.local` only has:**
   - `ANTHROPIC_API_KEY`
   - `OPENAI_API_KEY`
   - Missing all Supabase credentials

---

## Login Flow Breakdown

### Frontend (`pages/login.tsx`)
✅ **Status: Working**
- Email/password form submission
- Error handling
- Redirects to `/dashboard` on success
- Loading states

### Backend API (`pages/api/auth/login.ts`)
❌ **Status: Blocked at Supabase**
- Uses `createServerSupabaseClient()` from `lib/supabase-server.ts`
- Attempts to call `supabase.auth.signInWithPassword()`
- **FAILS** because Supabase client cannot be initialized (missing env vars)

### Root Cause
```
lib/supabase-server.ts → Missing environment variables
  ↓
throws Error: "Missing Supabase environment variables. 
Please configure SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in Vercel."
```

---

## Solution

### Step 1: Get Supabase Credentials

Go to your **Supabase Dashboard** and get:

1. **Project URL** (from Settings → API)
   - Looks like: `https://xxxxxxxxxxxx.supabase.co`

2. **Anon Key** (from Settings → API)
   - Starts with: `eyJ...` (JWT token)

3. **Service Role Key** (from Settings → API)
   - Starts with: `eyJ...` (JWT token)
   - ⚠️ **IMPORTANT**: Keep this secret! Only for server-side!

### Step 2: Update `.env.local`

Add these lines to `/Users/haroldtrapier/sturgeon-ai-prod/.env.local`:

```env
# Supabase Configuration (REQUIRED FOR LOGIN)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here

# Server-side Supabase (REQUIRED FOR API ROUTES)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

### Step 3: Restart Development Server

```bash
npm run dev
```

### Step 4: Test Login

1. Go to `http://localhost:3000/login`
2. Enter valid credentials (must exist in Supabase Auth)
3. Should redirect to `/dashboard`

---

## Environment Variable Reference

| Variable | Type | Where to Use | Required |
|----------|------|--------------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Public | Frontend + Backend | ✅ Yes |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public | Frontend + Backend | ✅ Yes |
| `SUPABASE_URL` | Private | Backend only | ✅ Yes |
| `SUPABASE_SERVICE_ROLE_KEY` | Private | Backend only | ✅ Yes |
| `ANTHROPIC_API_KEY` | Private | Backend | Optional |
| `OPENAI_API_KEY` | Private | Backend | Optional |

---

## Files That Need Supabase Config

1. **API Routes** (require server-side vars):
   - `pages/api/auth/login.ts` ← **This is breaking**
   - `pages/api/auth/signup.ts`
   - `pages/api/auth/reset-password.ts`

2. **Middleware** (requires public vars):
   - `middleware.ts`

3. **Client-side** (requires public vars):
   - `lib/supabase-client.ts`
   - `pages/dashboard.tsx`

---

## Deployment Configuration

For **Vercel deployment**, add these in Vercel Dashboard:

**Environment Variables → Add:**
```
NEXT_PUBLIC_SUPABASE_URL = https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY = your_anon_key_here
SUPABASE_URL = https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY = your_service_role_key_here
ANTHROPIC_API_KEY = your_key_here
OPENAI_API_KEY = your_key_here
```

---

## Troubleshooting

### Error: "Missing Supabase environment variables"
- ✅ Add `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` to `.env.local`
- ✅ Restart dev server

### Error: "Invalid login credentials"
- ✅ User doesn't exist in Supabase Auth
- ✅ Email/password is wrong
- ✅ Check Supabase user records

### Error: "Email not confirmed"
- ✅ User needs to verify email in Supabase
- ✅ Check Supabase for email confirmation status

### Session not persisting
- ✅ Verify `SUPABASE_SERVICE_ROLE_KEY` is correct
- ✅ Check browser cookies are enabled
- ✅ Verify `lib/supabase-server.ts` cookie handling

---

## Quick Verification

After adding Supabase vars, run this in terminal:

```bash
cd /Users/haroldtrapier/sturgeon-ai-prod

# Check env vars are loaded
echo $NEXT_PUBLIC_SUPABASE_URL
echo $SUPABASE_SERVICE_ROLE_KEY

# Should NOT be empty if configured correctly
```

---

## Next Steps

1. ✅ Get Supabase credentials from your project
2. ✅ Update `.env.local` with the credentials
3. ✅ Restart `npm run dev`
4. ✅ Test login at `http://localhost:3000/login`
5. ✅ If still issues, check Supabase user exists in Auth tab

**Need help?** Cursor is already open - just make the changes and save!

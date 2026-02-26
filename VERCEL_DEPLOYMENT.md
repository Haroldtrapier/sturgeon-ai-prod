# 🚀 VERCEL DEPLOYMENT GUIDE

## 📋 AUTOMATIC DEPLOYMENT SETUP

Your Sturgeon AI platform is now configured for automatic Vercel deployment!

---

## ⚙️ STEP 1: CONNECT TO VERCEL

### Option A: Vercel Dashboard (Easiest)

1. **Go to Vercel Dashboard:**
   - Visit https://vercel.com/dashboard
   - Click "Add New..." → "Project"

2. **Import Git Repository:**
   - Click "Import Git Repository"
   - Select "GitHub"
   - Find "Haroldtrapier/sturgeon-ai-prod"
   - Click "Import"

3. **Configure Project:**
   - **Project Name:** sturgeon-ai-prod
   - **Framework Preset:** Next.js
   - **Root Directory:** ./
   - **Build Command:** `npm run build`
   - **Output Directory:** .next
   - **Install Command:** `npm install`

4. **Add Environment Variables:**
   Click "Environment Variables" and add:

   ```
   NEXT_PUBLIC_DEMO_MODE = true
   OPENAI_API_KEY = (leave empty for now)
   ANTHROPIC_API_KEY = (leave empty for now)
   ```

5. **Deploy:**
   - Click "Deploy"
   - Wait 2-3 minutes
   - Your site is live!

### Option B: Vercel CLI (Advanced)

```bash
# Install Vercel CLI globally
npm install -g vercel

# Login to Vercel
vercel login

# Deploy from project directory
cd /path/to/sturgeon-ai-prod
vercel

# Follow prompts:
# - Set up and deploy? Yes
# - Which scope? Select your account
# - Link to existing project? No
# - What's your project's name? sturgeon-ai-prod
# - In which directory is your code located? ./
# - Want to override settings? No

# Your site is deployed!
# Production URL will be shown
```

---

## 🔧 STEP 2: CONFIGURE AUTOMATIC DEPLOYMENTS

### GitHub Actions Setup (Recommended)

We've created `.github/workflows/deploy.yml` for you:

1. **Add Vercel Secrets to GitHub:**

   Go to: `https://github.com/Haroldtrapier/sturgeon-ai-prod/settings/secrets/actions`

   Add these secrets:

   **Get VERCEL_TOKEN:**
   ```bash
   vercel login
   # Then visit: https://vercel.com/account/tokens
   # Create new token → Copy it
   ```

   **Get VERCEL_ORG_ID and VERCEL_PROJECT_ID:**
   ```bash
   cd /path/to/sturgeon-ai-prod
   vercel link
   # Creates .vercel folder with project.json
   cat .vercel/project.json
   # Copy orgId and projectId
   ```

   **Add to GitHub Secrets:**
   - `VERCEL_TOKEN` = Your Vercel token
   - `VERCEL_ORG_ID` = Your org ID from project.json
   - `VERCEL_PROJECT_ID` = Your project ID from project.json

2. **Push to main branch:**
   ```bash
   git push origin main
   ```

   **Automatic deployment triggers!**
   - GitHub Actions runs
   - Tests and builds project
   - Deploys to Vercel
   - Live in 2-3 minutes

3. **Check deployment status:**
   - Go to Actions tab in GitHub
   - See build progress
   - Get deployment URL

---

## 🌐 STEP 3: CONFIGURE CUSTOM DOMAIN (Optional)

### Add Custom Domain to Vercel

1. **In Vercel Dashboard:**
   - Go to Project Settings
   - Click "Domains"
   - Enter your domain: `sturgeonai.com`
   - Click "Add"

2. **Configure DNS:**

   **For Root Domain (sturgeonai.com):**
   ```
   Type: A
   Name: @
   Value: 76.76.21.21
   ```

   **For Subdomain (www.sturgeonai.com):**
   ```
   Type: CNAME
   Name: www
   Value: cname.vercel-dns.com
   ```

3. **Wait for DNS propagation:**
   - Usually 5-60 minutes
   - Vercel automatically issues SSL certificate
   - Your site is live on custom domain!

---

## 📊 STEP 4: ENABLE VERCEL ANALYTICS

### Built-in Vercel Analytics

1. **In Vercel Dashboard:**
   - Go to your project
   - Click "Analytics" tab
   - Click "Enable Analytics"

2. **Install Vercel Analytics package:**
   ```bash
   npm install @vercel/analytics
   ```

3. **Add to your app (already done in our setup!):**
   ```tsx
   // In app/layout.tsx
   import { Analytics } from '@vercel/analytics/react';

   export default function RootLayout({ children }) {
     return (
       <html>
         <body>
           {children}
           <Analytics />
         </body>
       </html>
     );
   }
   ```

4. **View Analytics:**
   - Real-time page views
   - Visitor locations
   - Device types
   - Popular pages
   - Referrer sources

---

## 🔄 DEPLOYMENT WORKFLOW

### How Automatic Deployment Works:

```
1. You push code to GitHub (main branch)
   ↓
2. GitHub Actions triggers
   ↓
3. Runs tests and lints
   ↓
4. Builds Next.js project
   ↓
5. Deploys to Vercel
   ↓
6. Your site is live! (2-3 minutes)
```

### Deployment URLs:

- **Production:** `https://sturgeon-ai-prod.vercel.app`
- **Preview (PRs):** Unique URL for each PR
- **Development:** `https://sturgeon-ai-prod-dev.vercel.app`

---

## 🧪 STEP 5: TEST DEPLOYMENT

### After deployment, test these URLs:

```bash
# Main site
https://sturgeon-ai-prod.vercel.app

# AI Chat
https://sturgeon-ai-prod.vercel.app/chat

# Marketing Agent
https://sturgeon-ai-prod.vercel.app/marketing

# Dashboard
https://sturgeon-ai-prod.vercel.app/dashboard

# API endpoints
https://sturgeon-ai-prod.vercel.app/api/chat
https://sturgeon-ai-prod.vercel.app/api/marketing
https://sturgeon-ai-prod.vercel.app/api/analytics
```

### What to check:

- [ ] Home page loads
- [ ] Chat widget appears
- [ ] /chat page works (shows DEMO MODE)
- [ ] /marketing page works (shows DEMO MODE)
- [ ] Model switcher functions
- [ ] Generate content button works
- [ ] Copy/download features work
- [ ] Analytics tracking active

---

## 🔐 STEP 6: PRODUCTION ENVIRONMENT VARIABLES

### When ready to activate (disable demo mode):

1. **In Vercel Dashboard:**
   - Go to Project Settings
   - Click "Environment Variables"
   - Edit or add:

```env
# Disable demo mode
NEXT_PUBLIC_DEMO_MODE = false

# Add real API keys
OPENAI_API_KEY = sk-proj-your-key-here
ANTHROPIC_API_KEY = sk-ant-your-key-here

# Analytics (optional)
NEXT_PUBLIC_ANALYTICS_ID = your-analytics-id
```

2. **Redeploy:**
   ```bash
   # Trigger redeploy via Vercel dashboard
   # OR push a new commit to GitHub
   git commit --allow-empty -m "Trigger redeploy"
   git push origin main
   ```

3. **Verify:**
   - No more [DEMO MODE] badges
   - Real AI responses
   - API usage shows in OpenAI/Anthropic dashboards

---

## 📈 STEP 7: MONITOR & OPTIMIZE

### Vercel Dashboard Features:

1. **Deployments:**
   - See all deployments
   - Rollback to previous versions
   - View build logs

2. **Analytics:**
   - Page views
   - Performance metrics
   - User locations

3. **Functions:**
   - Monitor API route performance
   - Track execution time
   - View errors

4. **Logs:**
   - Real-time function logs
   - Error tracking
   - Debug issues

---

## 🚨 TROUBLESHOOTING

### Build fails:

```bash
# Check build logs in Vercel dashboard
# OR test locally:
npm run build

# Common fixes:
npm install
npm run lint --fix
```

### Environment variables not working:

1. Check spelling (exact match)
2. Redeploy after adding variables
3. Use `NEXT_PUBLIC_` prefix for client-side variables

### Deployment timeout:

1. Check build time (should be <5 minutes)
2. Optimize dependencies
3. Remove unused packages

### Custom domain not working:

1. Wait for DNS propagation (up to 48 hours)
2. Verify DNS records in domain registrar
3. Check Vercel domain status

---

## ✅ DEPLOYMENT CHECKLIST

Before going live:

- [ ] Connected to Vercel
- [ ] Environment variables set (demo mode)
- [ ] GitHub Actions configured
- [ ] Test deployment successful
- [ ] Analytics enabled
- [ ] Custom domain configured (optional)
- [ ] SSL certificate active
- [ ] All pages load correctly
- [ ] API endpoints working
- [ ] Demo mode badges visible
- [ ] Ready to activate production

---

## 🎉 YOU'RE LIVE!

Your Sturgeon AI platform is now:
- ✅ **Auto-deploying** on every push
- ✅ **Globally distributed** (Vercel CDN)
- ✅ **SSL secured** (automatic HTTPS)
- ✅ **Analytics enabled** (real-time insights)
- ✅ **Serverless** (scales automatically)
- ✅ **Fast** (<100ms response times)

**Production URL:** https://sturgeon-ai-prod.vercel.app

---

**Questions?** Check Vercel docs: https://vercel.com/docs

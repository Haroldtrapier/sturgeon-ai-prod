# 🚀 Production Deployment Checklist

## Pre-Deployment

### Database (Supabase)
- [ ] Run migration: `supabase/migrations/002_add_user_id_and_rls.sql`
- [ ] Verify `opportunities` table has `user_id` column
- [ ] Verify RLS is enabled: `SELECT * FROM pg_tables WHERE tablename='opportunities' AND rowsecurity=true;`
- [ ] Test insert as authenticated user
- [ ] Test RLS policies work (can't see other user's data)

### Backend (Railway)
- [ ] Service is deployed and running
- [ ] Health endpoint responds: `curl https://acceptable-beauty.up.railway.app/health`
- [ ] Environment variables set:
  - [ ] `OPENAI_API_KEY`
  - [ ] `CORS_ORIGINS`
  - [ ] `PORT` (auto-set by Railway)
- [ ] Logs show no errors
- [ ] Can call `/agent/chat` endpoint

### Frontend (Vercel)
- [ ] Latest deployment is READY
- [ ] Environment variables set:
  - [ ] `NEXT_PUBLIC_SUPABASE_URL`
  - [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - [ ] `BACKEND_URL` or `NEXT_PUBLIC_API_URL`
  - [ ] `ANTHROPIC_API_KEY` (if using Claude)
  - [ ] `SAM_GOV_API_KEY` (if using SAM.gov API)
- [ ] Custom domain configured (optional)
- [ ] SSL certificate active

---

## Testing Checklist

### Authentication
- [ ] Can sign up new user
- [ ] Can log in existing user
- [ ] Session persists across page reloads
- [ ] Logout clears session
- [ ] Protected routes redirect to /login when not authenticated

### Marketplace Import
- [ ] Can access each marketplace page
- [ ] Can paste URL into import form
- [ ] Can paste text into import form
- [ ] Import saves to database
- [ ] Success message appears
- [ ] Error handling works (try empty form)

### Opportunities List
- [ ] Can view saved opportunities
- [ ] Only see own opportunities (RLS working)
- [ ] Can filter by source
- [ ] Can filter by status
- [ ] Pagination works (if implemented)

### AI Agent
- [ ] Agent page loads
- [ ] Can send message
- [ ] Receives response from backend
- [ ] Error handling works (test with backend down)
- [ ] Message history persists in session
- [ ] Loading states work

### API Endpoints
- [ ] `GET /api/health` returns 200
- [ ] `POST /api/opportunities/import` requires auth
- [ ] `GET /api/opportunities/import` returns user's data only
- [ ] `POST /api/agent` forwards to backend correctly

---

## Performance

- [ ] Page load < 2 seconds
- [ ] API responses < 1 second
- [ ] No console errors in browser
- [ ] No memory leaks (test long sessions)
- [ ] Lighthouse score > 90

---

## Security

- [ ] RLS enabled on all tables
- [ ] API keys not exposed in frontend
- [ ] CORS configured properly
- [ ] No SQL injection vulnerabilities
- [ ] Auth tokens in httpOnly cookies
- [ ] Rate limiting configured (optional)

---

## Monitoring

- [ ] Error tracking configured (Sentry/optional)
- [ ] Backend logs accessible in Railway
- [ ] Frontend errors visible in Vercel
- [ ] Database slow query monitoring (optional)

---

## Documentation

- [ ] README.md up to date
- [ ] API documentation complete
- [ ] Environment variables documented
- [ ] Deployment process documented

---

## Post-Deployment

- [ ] Monitor error rates first 24 hours
- [ ] Check database query performance
- [ ] Verify backup strategy
- [ ] Set up alerts for downtime
- [ ] Document any issues encountered

---

## Rollback Plan

If deployment fails:

1. **Vercel**: Rollback to previous deployment in dashboard
2. **Railway**: Redeploy previous working version
3. **Database**: Migrations are safe (added columns nullable)

---

## 🎯 Quick Start Verification

Run these commands to verify everything:

```bash
# Test Vercel frontend
curl -I https://sturgeon-ai-prod-1.vercel.app

# Test Vercel API health
curl https://sturgeon-ai-prod-1.vercel.app/api/health

# Test Railway backend
curl https://acceptable-beauty.up.railway.app/health

# Test database connection (from Supabase SQL Editor)
SELECT count(*) FROM public.opportunities;
```

**All should return 200 OK or valid JSON response.**

---

## 📞 Support

If issues arise:
- Check Railway logs
- Check Vercel deployment logs  
- Check Supabase logs
- Review error messages carefully
- Consult RAILWAY_DEPLOYMENT.md for specific fixes

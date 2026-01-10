# Railway Deployment Setup

## Quick Setup (5 minutes)

### 1. Install Railway CLI
```bash
# macOS
brew install railway

# Or use npm
npm i -g @railway/cli
```

### 2. Login to Railway
```bash
railway login
```

### 3. Create New Project
```bash
# In your project directory
cd /Users/haroldtrapier/sturgeon-ai-prod-1

# Initialize Railway
railway init
```

### 4. Add PostgreSQL Database
```bash
# In Railway dashboard or CLI
railway add --database postgres
```

### 5. Set Environment Variables
```bash
# Set required environment variables
railway variables set OPENAI_API_KEY=your_key_here
railway variables set SAM_GOV_API_KEY=your_key_here
railway variables set STRIPE_SECRET_KEY=your_key_here
railway variables set SUPABASE_URL=your_url_here
railway variables set SUPABASE_SERVICE_ROLE_KEY=your_key_here
```

### 6. Deploy
```bash
# Deploy to Railway
railway up
```

## GitHub Actions Deployment

The CI/CD workflow automatically deploys to Railway on push to main.

**Required GitHub Secret:**
- `RAILWAY_TOKEN` - Get from: https://railway.app/account/tokens

**To add the secret:**
1. Go to https://github.com/Haroldtrapier/sturgeon-ai-prod/settings/secrets/actions
2. Click "New repository secret"
3. Name: `RAILWAY_TOKEN`
4. Value: Your Railway API token
5. Click "Add secret"

## Service Configuration

Railway will automatically:
- ✅ Detect Python 3.11
- ✅ Install dependencies from `backend/requirements.txt`
- ✅ Start FastAPI with `uvicorn`
- ✅ Set up health checks at `/health`
- ✅ Configure auto-restart on failures

## Database Migrations

After first deployment:

```bash
# Connect to Railway
railway link

# Run migrations
railway run alembic upgrade head
```

Or use Railway dashboard:
1. Open your service
2. Go to "Variables" tab
3. Click "Raw Editor"
4. Add migration command to startup

## Monitoring

**Railway Dashboard:** https://railway.app/dashboard
- View logs
- Monitor metrics
- Manage environment variables
- Scale resources

## Production URLs

After deployment, you'll get:
- **Backend API:** `https://your-service.railway.app`
- **Frontend:** `https://sturgeon-ai-prod.vercel.app`

## Troubleshooting

### Build Fails
```bash
# Check logs
railway logs

# Rebuild
railway up --detach
```

### Database Connection Issues
```bash
# Get DATABASE_URL
railway variables

# Test connection
railway run python -c "import psycopg2; print('Connected!')"
```

### Environment Variables
```bash
# List all variables
railway variables

# Update a variable
railway variables set KEY=value
```

## Cost Optimization

Railway free tier includes:
- $5/month free credits
- 500 hours of execution time
- 1GB RAM per service

For production, consider:
- Starter plan: $5/month + usage
- Pro plan: Custom pricing

## Next Steps

1. ✅ Deploy backend to Railway
2. ✅ Run database migrations
3. ✅ Test API endpoints
4. ✅ Monitor logs for errors
5. ✅ Set up custom domain (optional)

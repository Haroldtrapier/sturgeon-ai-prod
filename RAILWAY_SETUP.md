# Harpoon AI - Railway Deployment Setup

This guide explains how to connect and deploy the Harpoon AI backend to Railway.

## Quick Setup (5 minutes)

### 1. Install Railway CLI
```bash
# macOS
brew install railway

# Or use npm
npm i -g @railway/cli

# Verify installation
railway version
```

### 2. Login to Railway
```bash
railway login
# This will open a browser for authentication
```

### 3. Create New Project
```bash
# In your project directory
cd /path/to/harpoon-ai

# Initialize Railway project
railway init

# Or link to an existing project
railway link
```

### 4. Configure Environment Variables
```bash
# Required variables
railway variables set OPENAI_API_KEY=your_key_here
railway variables set SAM_GOV_API_KEY=your_key_here

# Supabase configuration
railway variables set SUPABASE_URL=your_url_here
railway variables set SUPABASE_SERVICE_ROLE_KEY=your_key_here

# Optional: Anthropic API
railway variables set ANTHROPIC_API_KEY=your_key_here

# Optional: Stripe for billing
railway variables set STRIPE_SECRET_KEY=your_key_here

# Optional: CORS configuration
railway variables set CORS_ORIGINS=https://your-frontend.vercel.app
```

See `env.railway.example` for all available environment variables.

### 5. Deploy
```bash
# Deploy to Railway
railway up

# Or deploy in detached mode
railway up --detach
```

## GitHub Actions Deployment

The CI/CD workflow automatically deploys to Railway on push to main.

**Required GitHub Secret:**
- `RAILWAY_TOKEN` - Get from: https://railway.app/account/tokens

**To add the secret:**
1. Go to your repository Settings > Secrets and variables > Actions
2. Click "New repository secret"
3. Name: `RAILWAY_TOKEN`
4. Value: Your Railway API token
5. Click "Add secret"

**Optional GitHub Secrets:**
- `RAILWAY_SERVICE_ID` - For multi-service Railway projects
- `RAILWAY_DOMAIN` - For health check verification in CI

## Service Configuration

Railway will automatically:
- Build using the Dockerfile (Python 3.11 + FastAPI)
- Install dependencies from `backend/requirements.txt`
- Start FastAPI with `uvicorn`
- Set up health checks at `/health`
- Auto-restart on failures (up to 5 retries)

## Configuration Files

| File | Purpose |
|------|---------|
| `railway.json` | Railway service config (builder, health checks) |
| `railway.toml` | Alternative TOML-based config |
| `Dockerfile` | Docker build definition |
| `.railwayignore` | Files excluded from builds |

## Database Migrations

After first deployment:

```bash
# Connect to Railway
railway link

# Run migrations
railway run alembic upgrade head
```

## Monitoring

**Railway Dashboard:** https://railway.app/dashboard
- View logs
- Monitor metrics
- Manage environment variables
- Scale resources

## Production URLs

After deployment, you'll get:
- **Backend API:** `https://your-service.up.railway.app`
- **API Docs:** `https://your-service.up.railway.app/docs`
- **Health Check:** `https://your-service.up.railway.app/health`
- **Frontend:** `https://your-frontend.vercel.app`

## Troubleshooting

### Build Fails
```bash
# Check logs
railway logs

# Rebuild
railway up --detach
```

### Health Check Fails
The Dockerfile includes a health check that hits `/health`. Make sure:
1. The `PORT` environment variable is set by Railway
2. The FastAPI app is starting correctly
3. Check logs with `railway logs`

### Environment Variables
```bash
# List all variables
railway variables

# Update a variable
railway variables set KEY=value
```

# Sturgeon AI Backend

FastAPI backend for AI-powered government contracting features.

## Setup

```bash
cd backend
pip install -r requirements.txt
```

## Environment Variables

Create `.env` file:

```env
OPENAI_API_KEY=your_key_here
CORS_ORIGINS=https://your-app.vercel.app,http://localhost:3000
DATABASE_URL=your_db_url  # Optional
```

## Run Development Server

```bash
uvicorn main:app --reload --port 8000
```

## Deploy to Railway

1. Create new project on Railway
2. Connect your GitHub repo
3. Set root directory to `/backend`
4. Add environment variables
5. Deploy

## API Endpoints

- `GET /health` - Health check
- `POST /agent/chat` - AI chat
- `POST /opportunities/parse` - Parse opportunity text

## Integration with Frontend

Add to Vercel environment variables:

```
BACKEND_URL=https://your-backend.railway.app
```

import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.routers.chat import router as chat_router

APP_NAME = "sturgeon-backend"

def _cors_origins() -> list[str]:
    origins = os.getenv("CORS_ORIGINS", "")
    if origins.strip():
        return [o.strip() for o in origins.split(",") if o.strip()]
    return ["*"]

app = FastAPI(title=APP_NAME, version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=_cors_origins(),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
def health():
    return {"status": "ok", "service": APP_NAME, "has_openai_key": bool(os.getenv("OPENAI_API_KEY"))}

app.include_router(chat_router)

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("backend.main:app", host="0.0.0.0", port=port, reload=False)

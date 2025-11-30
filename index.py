import sys
import os

# Add current directory to Python path
sys.path.insert(0, os.path.dirname(__file__))

from mangum import Mangum
from backend.main import app as fastapi_app

# Expose the app directly for Vercel FastAPI detection
app = fastapi_app

# Vercel serverless handler
handler = Mangum(fastapi_app)

import sys
import os

# Add root directory to Python path for Vercel serverless
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from mangum import Mangum
from backend.main import app

# Vercel serverless handler
handler = Mangum(app)

from mangum import Mangum
from backend.main import app

# Vercel serverless handler
handler = Mangum(app)

#!/bin/sh
# Railway provides PORT as environment variable
PORT=${PORT:-8000}
exec uvicorn main_minimal:app --host 0.0.0.0 --port $PORT

#!/usr/bin/env python3
"""
Initialize database tables
"""
import asyncio
from database import init_models

async def main():
    print("Creating database tables...")
    await init_models()
    print("✅ Database tables created successfully!")

if __name__ == "__main__":
    asyncio.run(main())

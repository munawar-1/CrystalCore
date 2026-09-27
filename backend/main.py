"""
GeoHindsight / CrystalCore Backend Server Entrypoint.
Imports modular FastAPI application from app.main.
"""

import os
import uvicorn
from app.main import app
from app.core.config import settings

if __name__ == "__main__":
    print(f"🚀 Starting {settings.PROJECT_NAME} on http://127.0.0.1:{settings.PORT}")
    uvicorn.run("app.main:app", host=settings.HOST, port=settings.PORT, reload=True)

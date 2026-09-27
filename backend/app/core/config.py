"""
Core configuration and environment settings for GeoHindsight / CrystalCore.
"""

import os
from dotenv import load_dotenv

# Ensure .env is loaded from backend directory
backend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
env_path = os.path.join(backend_dir, ".env")
load_dotenv(env_path)

class Settings:
    PROJECT_NAME: str = "CrystalCore (GeoHindsight API)"
    VERSION: str = "1.0.0"
    DESCRIPTION: str = "Autonomous SEO & AI Citation Intelligence Agent powered by Vectorize Hindsight."
    
    # Engine Keys
    GROQ_API_KEY: str = os.getenv("GROQ_API_KEY", "")
    GROQ_MODEL: str = os.getenv("GROQ_MODEL", "openai/gpt-oss-120b")
    
    HINDSIGHT_API_KEY: str = os.getenv("HINDSIGHT_API_KEY", "")
    HINDSIGHT_BANK_ID: str = os.getenv("HINDSIGHT_BANK_ID", "linear-seo-intelligence")
    
    PORT: int = int(os.getenv("PORT", 8000))
    HOST: str = "0.0.0.0"

    # Static Directories
    REACT_DIST_DIR: str = os.path.abspath(os.path.join(backend_dir, "..", "frontend_react", "dist"))
    LEGACY_FRONTEND_DIR: str = os.path.abspath(os.path.join(backend_dir, "..", "frontend"))
    FRONTEND_DIR: str = REACT_DIST_DIR if os.path.exists(REACT_DIST_DIR) else LEGACY_FRONTEND_DIR

settings = Settings()

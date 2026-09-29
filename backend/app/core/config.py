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
    GROQ_MODEL: str = os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile")
    
    HINDSIGHT_API_KEY: str = os.getenv("HINDSIGHT_API_KEY", "")
    HINDSIGHT_BASE_URL: str = os.getenv("HINDSIGHT_BASE_URL", "https://api.hindsight.vectorize.io")
    HINDSIGHT_BANK_ID: str = os.getenv("HINDSIGHT_BANK_ID", "linear-seo-intelligence")

    # Perplexity API Configuration (Sonar Search)
    PERPLEXITY_API_KEY: str = os.getenv("PERPLEXITY_API_KEY", "")
    PERPLEXITY_MODEL: str = os.getenv("PERPLEXITY_MODEL", "sonar")

    # Automation Cron Schedules
    JIRA_MONITOR_CRON: str = os.getenv("JIRA_MONITOR_CRON", "0 2 * * *")
    CITATION_PROBE_CRON: str = os.getenv("CITATION_PROBE_CRON", "0 3 * * 1")

    # Competitor Scraper Settings
    ATLASSIAN_SITEMAP_URL: str = os.getenv("ATLASSIAN_SITEMAP_URL", "https://www.atlassian.com/sitemaps/products.xml")
    MONITORED_JIRA_URLS: list = [
        u.strip() for u in os.getenv(
            "MONITORED_JIRA_URLS",
            "https://www.atlassian.com/software/jira/vs-linear"
        ).split(",") if u.strip()
    ]

    # Database Path
    DATA_DIR: str = os.path.abspath(os.path.join(backend_dir, "data"))
    DB_PATH: str = os.getenv("DB_PATH", os.path.join(DATA_DIR, "crystalcore.db"))

    PORT: int = int(os.getenv("PORT", 8000))
    HOST: str = "0.0.0.0"

    # Static Directories
    REACT_DIST_DIR: str = os.path.abspath(os.path.join(backend_dir, "..", "frontend_react", "dist"))
    LEGACY_FRONTEND_DIR: str = os.path.abspath(os.path.join(backend_dir, "..", "frontend"))
    FRONTEND_DIR: str = REACT_DIST_DIR if os.path.exists(REACT_DIST_DIR) else LEGACY_FRONTEND_DIR

settings = Settings()

"""
Main FastAPI application entrypoint.
Configures CORS, routes, static mounts, and SPA fallback.
"""

import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

from app.core.config import settings
from app.core.database import init_db
from app.jobs.scheduler import scheduler
from app.api.router import api_router

def create_app() -> FastAPI:
    app = FastAPI(
        title=settings.PROJECT_NAME,
        version=settings.VERSION,
        description=settings.DESCRIPTION
    )

    @app.on_event("startup")
    async def startup_event():
        init_db()
        scheduler.start()

    @app.on_event("shutdown")
    async def shutdown_event():
        scheduler.stop()

    # Enable CORS
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Mount API routes under /api
    app.include_router(api_router)

    # Static Assets & SPA routing
    dist_dir = settings.REACT_DIST_DIR
    legacy_dir = settings.LEGACY_FRONTEND_DIR

    if os.path.exists(os.path.join(dist_dir, "assets")):
        app.mount("/assets", StaticFiles(directory=os.path.join(dist_dir, "assets")), name="assets")

    if os.path.exists(legacy_dir):
        app.mount("/static", StaticFiles(directory=legacy_dir), name="static")

    # Landing Page
    @app.api_route("/", methods=["GET", "HEAD"])
    def serve_root():
        if os.path.exists(os.path.join(dist_dir, "index.html")):
            return FileResponse(os.path.join(dist_dir, "index.html"))
        landing_file = os.path.join(legacy_dir, "landing.html")
        if os.path.exists(landing_file):
            return FileResponse(landing_file)
        return {"message": f"{settings.PROJECT_NAME} is running."}

    @app.api_route("/landing", methods=["GET", "HEAD"])
    def serve_landing():
        if os.path.exists(os.path.join(dist_dir, "index.html")):
            return FileResponse(os.path.join(dist_dir, "index.html"))
        landing_file = os.path.join(legacy_dir, "landing.html")
        if os.path.exists(landing_file):
            return FileResponse(landing_file)
        raise HTTPException(status_code=404, detail="Landing page not found")

    # Agent Workspace / Copilot Studio
    @app.api_route("/app", methods=["GET", "HEAD"])
    def serve_app():
        if os.path.exists(os.path.join(dist_dir, "index.html")):
            return FileResponse(os.path.join(dist_dir, "index.html"))
        index_file = os.path.join(legacy_dir, "index.html")
        if os.path.exists(index_file):
            return FileResponse(index_file)
        raise HTTPException(status_code=404, detail="Copilot workspace not found")

    @app.api_route("/avatar.jpg", methods=["GET", "HEAD"])
    def serve_avatar():
        for d in [dist_dir, legacy_dir]:
            f = os.path.join(d, "avatar.jpg")
            if os.path.exists(f):
                return FileResponse(f)
        raise HTTPException(status_code=404, detail="Avatar not found")

    @app.api_route("/favicon.svg", methods=["GET", "HEAD"])
    def serve_favicon():
        for d in [dist_dir, legacy_dir]:
            f = os.path.join(d, "favicon.svg")
            if os.path.exists(f):
                return FileResponse(f)
        raise HTTPException(status_code=404, detail="Favicon not found")

    @app.api_route("/icons.svg", methods=["GET", "HEAD"])
    def serve_icons():
        for d in [dist_dir, legacy_dir]:
            f = os.path.join(d, "icons.svg")
            if os.path.exists(f):
                return FileResponse(f)
        raise HTTPException(status_code=404, detail="Icons not found")

    return app

app = create_app()

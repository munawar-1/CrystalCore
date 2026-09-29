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
from app.api.router import api_router

def create_app() -> FastAPI:
    app = FastAPI(
        title=settings.PROJECT_NAME,
        version=settings.VERSION,
        description=settings.DESCRIPTION
    )

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

    @app.api_route("/demo-video", methods=["GET", "HEAD"])
    def download_demo():
        path = "/Users/munawar/Hackathons/HWH/crystalcore_demo.webp"
        if os.path.exists(path):
            return FileResponse(path, media_type="image/webp", filename="crystalcore_demo.webp")
        raise HTTPException(status_code=404, detail="Demo video not found")

    @app.api_route("/demo-mp4", methods=["GET", "HEAD"])
    def download_demo_mp4():
        path = "/Users/munawar/Hackathons/HWH/crystalcore_demo.mp4"
        if os.path.exists(path):
            return FileResponse(path, media_type="video/mp4", filename="crystalcore_demo.mp4")
        raise HTTPException(status_code=404, detail="MP4 video not found")

    @app.api_route("/demo-voiced", methods=["GET", "HEAD"])
    def download_demo_voiced():
        path = "/Users/munawar/Hackathons/HWH/crystalcore_demo_voiced.mp4"
        if os.path.exists(path):
            return FileResponse(path, media_type="video/mp4", filename="crystalcore_demo_voiced.mp4")
        raise HTTPException(status_code=404, detail="Voiced MP4 video not found")

    @app.api_route("/download", methods=["GET", "HEAD"])
    def download_page():
        from fastapi.responses import HTMLResponse
        html_content = """<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Download CrystalCore Demo Video</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #0a0b10; color: #f0f2f5; margin: 0; padding: 2rem; display: flex; flex-direction: column; align-items: center; }
    .card { max-width: 900px; width: 100%; background: #12141e; border: 1px solid #232738; border-radius: 16px; padding: 2rem; box-shadow: 0 20px 40px rgba(0,0,0,0.6); }
    h1 { margin-top: 0; font-size: 1.8rem; color: #38bdf8; display: flex; align-items: center; gap: 0.5rem; }
    .badge { background: rgba(16, 185, 129, 0.2); color: #34d399; font-size: 0.8rem; padding: 0.25rem 0.6rem; border-radius: 999px; border: 1px solid rgba(16, 185, 129, 0.4); }
    .video-box { width: 100%; border-radius: 12px; overflow: hidden; border: 1px solid #2a2f45; margin: 1.5rem 0; background: #000; }
    .video-box video { width: 100%; height: auto; display: block; }
    .btn-row { display: flex; gap: 1rem; flex-wrap: wrap; margin-bottom: 2rem; }
    .btn { background: #10b981; color: #022c22; font-weight: 700; padding: 0.85rem 1.75rem; border-radius: 10px; text-decoration: none; display: inline-flex; align-items: center; gap: 0.5rem; transition: transform 0.15s ease, background 0.15s ease; cursor: pointer; border: none; font-size: 1rem; }
    .btn:hover { background: #34d399; transform: translateY(-2px); }
    .btn-secondary { background: #1e2335; color: #f0f2f5; border: 1px solid #333a54; }
    .btn-secondary:hover { background: #282e46; color: #fff; }
  </style>
</head>
<body>
  <div class="card">
    <h1>CrystalCore Voiced Demo <span class="badge">100% Synced Audio &bull; 40.3s</span></h1>
    <p style="color: #94a3b8; margin: 0.25rem 0 1.5rem;">Audio is hard-locked to every screen transition (Landing Page, Timeline, Marketing, Hindsight Memory, Chat).</p>
    
    <div class="btn-row">
      <a href="/demo-voiced" download="crystalcore_demo_voiced.mp4" class="btn">
        <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
        Download Final Synced Video (.mp4)
      </a>
      <a href="/demo-mp4" download="crystalcore_demo.mp4" class="btn btn-secondary">
        Silent Video Only (.mp4)
      </a>
    </div>

    <div class="video-box">
      <video controls autoplay loop>
        <source src="/demo-voiced" type="video/mp4">
        Your browser does not support the video tag.
      </video>
    </div>
  </div>
</body>
</html>"""
        return HTMLResponse(content=html_content)

    return app

app = create_app()

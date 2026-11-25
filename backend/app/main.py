import os
from pathlib import Path
from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.responses import FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles

from app.config import get_settings
from app.database import Base, SessionLocal, engine
from app.middleware.rate_limit import AuthRateLimitMiddleware
from app.middleware.security_headers import SecurityHeadersMiddleware
from app.routers import (
    admin,
    auth,
    candidates,
    elections,
    profile,
    results,
    transparency,
    voting,
)
from app.services.seed_service import seed_demo_data

# Ensure all models are imported before metadata.create_all
import app.models  # noqa: F401


@asynccontextmanager
async def lifespan(_app: FastAPI):
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        seed_demo_data(db)
    finally:
        db.close()
    yield


def create_app() -> FastAPI:
    settings = get_settings()
    app = FastAPI(
        title="SecureVote API",
        description=(
            "Digital Voting & Election Management Platform (Hackathon Prototype). "
            "Uses simulated election data and session-based RBAC; not for production elections."
        ),
        version="1.0.0",
        lifespan=lifespan,
    )

    app.add_middleware(GZipMiddleware, minimum_size=500)
    app.add_middleware(SecurityHeadersMiddleware)
    app.add_middleware(AuthRateLimitMiddleware)
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins_list,
        allow_credentials=True,
        allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
        allow_headers=["Content-Type", "X-CSRF-Token", "Authorization"],
    )

    @app.exception_handler(Exception)
    async def unhandled_exception_handler(_request: Request, _exc: Exception):
        return JSONResponse(
            status_code=500,
            content={"detail": "An unexpected server error occurred. Please try again."},
        )

    app.include_router(auth.router)
    app.include_router(profile.router)
    app.include_router(elections.router)
    app.include_router(candidates.router)
    app.include_router(voting.router)
    app.include_router(results.router)
    app.include_router(transparency.router)
    app.include_router(admin.router)

    @app.get("/api/health", tags=["Health"])
    def health_check():
        return {
            "status": "ok",
            "service": settings.APP_NAME,
            "mode": "prototype_simulation",
        }

    # Optional single-container SPA static serving (enabled in Docker/Render production)
    dist_dir = Path(__file__).resolve().parents[2] / "frontend" / "dist"
    if os.getenv("SERVE_SPA", "").lower() == "true" and dist_dir.is_dir():
        assets_dir = dist_dir / "assets"
        if assets_dir.is_dir():
            app.mount("/assets", StaticFiles(directory=str(assets_dir)), name="assets")

        @app.get("/{full_path:path}", include_in_schema=False)
        def serve_spa(full_path: str):
            if full_path.startswith("api"):
                raise HTTPException(status_code=404, detail="API endpoint not found.")
            candidate = (dist_dir / full_path).resolve()
            if full_path and candidate.is_file() and dist_dir in candidate.parents:
                return FileResponse(str(candidate))
            return FileResponse(str(dist_dir / "index.html"))

    return app


app = create_app()

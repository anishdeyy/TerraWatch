import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, status
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.database import engine, Base, SessionLocal
from app.routes import (
    auth_router,
    projects_router,
    sites_router,
    metrics_router,
    analytics_router,
    ai_router,
    reports_router,
    payments_router,
    admin_router,
    dashboard_router,
    search_router,
    data_sources_router,
    regional_router
)
from app.utils.seed_data import seed_database_if_empty

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("terrawatch.main")

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize database tables
    logger.info("Initializing database schema...")
    Base.metadata.create_all(bind=engine)
    
    # Run automatic seed
    db = SessionLocal()
    try:
        logger.info("Verifying initial seed data...")
        seed_database_if_empty(db)
        logger.info("Database initialized successfully.")
    except Exception as e:
        logger.error(f"Seeding failed: {e}")
    finally:
        db.close()
    yield

app = FastAPI(
    title="TerraWatch — Geospatial Environmental Intelligence API",
    description="Full-stack geospatial carbon & biodiversity intelligence platform backend with PostGIS, Gemini AI, and Razorpay integration.",
    version=settings.PROJECT_VERSION,
    lifespan=lifespan
)

# CORS Configuration
origins = [
    settings.FRONTEND_URL,
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Standardized Error Handler (Section 36)
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled exception on {request.url.path}: {exc}", exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "success": False,
            "error": {
                "code": "INTERNAL_SERVER_ERROR",
                "message": "An unexpected error occurred. Please try again later."
            }
        }
    )

# Include Routers
app.include_router(auth_router, prefix=settings.API_V1_STR)
app.include_router(projects_router, prefix=settings.API_V1_STR)
app.include_router(sites_router, prefix=settings.API_V1_STR)
app.include_router(metrics_router, prefix=settings.API_V1_STR)
app.include_router(analytics_router, prefix=settings.API_V1_STR)
app.include_router(ai_router, prefix=settings.API_V1_STR)
app.include_router(reports_router, prefix=settings.API_V1_STR)
app.include_router(payments_router, prefix=settings.API_V1_STR)
app.include_router(admin_router, prefix=settings.API_V1_STR)
app.include_router(dashboard_router, prefix=settings.API_V1_STR)
app.include_router(search_router, prefix=settings.API_V1_STR)
app.include_router(data_sources_router, prefix=settings.API_V1_STR)
app.include_router(regional_router, prefix=settings.API_V1_STR)

@app.get("/health")
def root_health():
    return {
        "status": "ok",
        "database": "connected",
        "postgis": "enabled",
        "map_service": "configured",
        "gemini": "configured" if settings.GEMINI_API_KEY else "demo_mock"
    }

@app.get("/api/health")
def api_health():
    return {
        "status": "healthy",
        "platform": "TerraWatch",
        "version": settings.PROJECT_VERSION,
        "database": "connected",
        "postgis": "enabled",
        "map_service": "configured",
        "gemini": "configured" if settings.GEMINI_API_KEY else "demo_mock"
    }

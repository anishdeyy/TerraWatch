from app.routes.auth import router as auth_router
from app.routes.projects import router as projects_router
from app.routes.sites import router as sites_router
from app.routes.metrics import router as metrics_router
from app.routes.analytics import router as analytics_router
from app.routes.ai import router as ai_router
from app.routes.reports import router as reports_router
from app.routes.payments import router as payments_router
from app.routes.admin import router as admin_router
from app.routes.dashboard import router as dashboard_router
from app.routes.search import router as search_router
from app.routes.data_sources import router as data_sources_router
from app.routes.regional import router as regional_router

__all__ = [
    "auth_router",
    "projects_router",
    "sites_router",
    "metrics_router",
    "analytics_router",
    "ai_router",
    "reports_router",
    "payments_router",
    "admin_router",
    "dashboard_router",
    "search_router",
    "data_sources_router",
    "regional_router",
]


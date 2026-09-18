from app.schemas.auth import UserRegister, UserLogin, UserResponse, Token
from app.schemas.project import ProjectCreate, ProjectUpdate, ProjectResponse
from app.schemas.site import SiteCreate, SiteUpdate, SiteResponse, GeoJSONFeatureCollection
from app.schemas.metric import MetricCreate, MetricResponse, MetricTrendsResponse
from app.schemas.analytics import HealthScoreBreakdown, SiteAnalyticsResponse, ProjectAnalyticsResponse, AlertItem
from app.schemas.ai import (
    SiteSummaryRequest, SiteSummaryResponse,
    RecommendationRequest, RecommendationResponse,
    AnomalyExplanationRequest, AnomalyExplanationResponse,
    ProjectSummaryRequest, ProjectSummaryResponse,
    AskAIRequest, AskAIResponse
)
from app.schemas.report import ReportGenerateRequest, ReportResponse
from app.schemas.payment import (
    PackageResponse, CreateOrderRequest, CreateOrderResponse,
    VerifyPaymentRequest, VerifyPaymentResponse, OrderHistoryResponse
)

__all__ = [
    "UserRegister", "UserLogin", "UserResponse", "Token",
    "ProjectCreate", "ProjectUpdate", "ProjectResponse",
    "SiteCreate", "SiteUpdate", "SiteResponse", "GeoJSONFeatureCollection",
    "MetricCreate", "MetricResponse", "MetricTrendsResponse",
    "HealthScoreBreakdown", "SiteAnalyticsResponse", "ProjectAnalyticsResponse", "AlertItem",
    "SiteSummaryRequest", "SiteSummaryResponse",
    "RecommendationRequest", "RecommendationResponse",
    "AnomalyExplanationRequest", "AnomalyExplanationResponse",
    "ProjectSummaryRequest", "ProjectSummaryResponse",
    "AskAIRequest", "AskAIResponse",
    "ReportGenerateRequest", "ReportResponse",
    "PackageResponse", "CreateOrderRequest", "CreateOrderResponse",
    "VerifyPaymentRequest", "VerifyPaymentResponse", "OrderHistoryResponse"
]

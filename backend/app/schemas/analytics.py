from pydantic import BaseModel
from typing import Optional, List, Dict, Any

class HealthScoreBreakdown(BaseModel):
    overall_score: float  # 0 - 100
    label: str = "Composite demo index — configurable weighting"
    breakdown: Dict[str, float]  # biodiversity (30%), vegetation (20%), carbon (20%), soil (15%), water (15%)
    weights: Dict[str, float]

class AlertItem(BaseModel):
    id: str
    site_id: int
    site_name: str
    project_id: int
    project_name: str
    severity: str  # LOW, MEDIUM, HIGH, CRITICAL
    metric: str
    current_value: float
    previous_value: float
    change_pct: float
    timestamp: str
    recommended_action: str

class SiteAnalyticsResponse(BaseModel):
    site_id: int
    site_name: str
    project_id: int
    project_name: str
    area_hectares: float
    status: str
    latest_metrics: Dict[str, Any]
    health_score: HealthScoreBreakdown
    alerts: List[AlertItem]

class ProjectAnalyticsResponse(BaseModel):
    project_id: int
    project_name: str
    project_type: str
    total_area_hectares: float
    site_count: int
    average_health_score: float
    total_carbon_stock: float
    average_biodiversity: float
    average_ndvi: float
    active_alerts_count: int
    sites_summary: List[Dict[str, Any]]

class ComparisonRequest(BaseModel):
    site_ids: List[int]
    metric_keys: Optional[List[str]] = None

class ComparisonResponse(BaseModel):
    sites: List[Dict[str, Any]]

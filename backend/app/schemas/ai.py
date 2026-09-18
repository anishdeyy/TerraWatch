from pydantic import BaseModel
from typing import Optional, List, Dict, Any

class SiteSummaryRequest(BaseModel):
    site_id: int

class SiteSummaryResponse(BaseModel):
    site_id: int
    site_name: str
    summary: str
    key_findings: List[str]
    risk_factors: List[str]
    recommended_actions: List[str]
    priority: str  # LOW, MEDIUM, HIGH, URGENT
    confidence: str  # High, Medium, Low
    limitations: List[str]

class RecommendationItem(BaseModel):
    recommendation: str
    why_it_may_help: str
    affected_metrics: List[str]
    expected_direction_of_change: str
    time_horizon: str  # Short Term, Medium Term, Long Term
    confidence: str
    data_limitations: str

class RecommendationRequest(BaseModel):
    site_id: int

class RecommendationResponse(BaseModel):
    site_id: int
    site_name: str
    analysis: str
    recommendations: List[RecommendationItem]

class AnomalyExplanationRequest(BaseModel):
    site_id: int
    metric_name: Optional[str] = "ndvi"
    drop_percentage: Optional[float] = 16.5

class AnomalyExplanationResponse(BaseModel):
    site_id: int
    site_name: str
    metric: str
    anomaly_detected: str
    hypotheses: List[str]
    possible_contributing_factors: List[str]
    confidence_level: str
    recommended_ground_investigation: List[str]

class ProjectSummaryRequest(BaseModel):
    project_id: int

class ProjectSummaryResponse(BaseModel):
    project_id: int
    project_name: str
    executive_summary: str
    project_status: str
    key_environmental_trends: List[str]
    highest_risk_sites: List[str]
    positive_trends: List[str]
    priority_recommendations: List[str]
    data_gaps: List[str]
    next_monitoring_actions: List[str]

class AskAIRequest(BaseModel):
    question: str
    project_id: Optional[int] = None
    site_id: Optional[int] = None

class AskAIResponse(BaseModel):
    question: str
    answer: str
    referenced_sites: List[str]
    key_metrics_considered: List[str]
    confidence: str
    grounding_notes: str

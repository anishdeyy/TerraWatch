from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
from app.database import get_db
from app.models.project import Project
from app.models.site import Site
from app.models.metric import EnvironmentalMetric
from app.services.analytics_service import evaluate_site_alerts

router = APIRouter(prefix="/dashboard", tags=["Dashboard Summary"])

class DashboardSummaryResponse(BaseModel):
    active_projects: int
    total_sites: int
    total_area_hectares: float
    carbon_stock: float
    biodiversity_score: float
    ndvi: float
    water_stress: float
    active_alerts: int
    is_demo: bool = True
    notice: str = "Demo Environment — Synthetic environmental data"

@router.get("/summary", response_model=DashboardSummaryResponse)
def get_dashboard_summary(db: Session = Depends(get_db)):
    """Computes live aggregated portfolio metrics across all projects and sites."""
    projects = db.query(Project).all()
    sites = db.query(Site).all()
    
    active_projects = len([p for p in projects if p.status == "ACTIVE"])
    total_sites = len(sites)
    total_area = round(sum(s.area_hectares or 0.0 for s in sites), 1)

    carbon_stocks = []
    bio_scores = []
    ndvi_scores = []
    water_scores = []
    total_alerts = 0

    for s in sites:
        metrics = (
            db.query(EnvironmentalMetric)
            .filter(EnvironmentalMetric.site_id == s.id)
            .order_by(EnvironmentalMetric.recorded_at.desc())
            .all()
        )
        if metrics:
            latest = metrics[0]
            if latest.carbon_stock is not None:
                carbon_stocks.append(latest.carbon_stock)
            if latest.biodiversity_score is not None:
                bio_scores.append(latest.biodiversity_score)
            if latest.ndvi is not None:
                ndvi_scores.append(latest.ndvi)
            if latest.water_stress is not None:
                water_scores.append(latest.water_stress)
        
        s_alerts = evaluate_site_alerts(s, metrics)
        total_alerts += len(s_alerts)

    avg_carbon = round(sum(carbon_stocks) / len(carbon_stocks), 1) if carbon_stocks else 1840.0
    avg_bio = round(sum(bio_scores) / len(bio_scores), 1) if bio_scores else 78.4
    avg_ndvi = round(sum(ndvi_scores) / len(ndvi_scores), 2) if ndvi_scores else 0.68
    avg_water = round(sum(water_scores) / len(water_scores), 1) if water_scores else 34.2

    return DashboardSummaryResponse(
        active_projects=active_projects or 4,
        total_sites=total_sites or 15,
        total_area_hectares=total_area or 7600.5,
        carbon_stock=avg_carbon,
        biodiversity_score=avg_bio,
        ndvi=avg_ndvi,
        water_stress=avg_water,
        active_alerts=total_alerts,
        is_demo=True,
        notice="Demo Environment — Synthetic environmental data"
    )

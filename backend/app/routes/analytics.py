from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.site import Site
from app.models.project import Project
from app.models.metric import EnvironmentalMetric
from app.schemas.analytics import (
    SiteAnalyticsResponse, ProjectAnalyticsResponse,
    ComparisonResponse, AlertItem
)
from app.services.analytics_service import compute_health_score, evaluate_site_alerts

router = APIRouter(prefix="", tags=["Analytics & Health Scores"])

@router.get("/sites/{site_id}/analytics", response_model=SiteAnalyticsResponse)
def get_site_analytics(site_id: int, db: Session = Depends(get_db)):
    site = db.query(Site).filter(Site.id == site_id).first()
    if not site:
        raise HTTPException(status_code=404, detail="Site not found")

    metrics = (
        db.query(EnvironmentalMetric)
        .filter(EnvironmentalMetric.site_id == site_id)
        .order_by(EnvironmentalMetric.recorded_at.desc())
        .all()
    )

    latest_m = metrics[0] if metrics else None
    health_score = compute_health_score(latest_m)
    alerts = evaluate_site_alerts(site, metrics)

    latest_dict = {}
    if latest_m:
        latest_dict = {
            "recorded_at": latest_m.recorded_at.isoformat(),
            "ndvi": latest_m.ndvi,
            "biodiversity_score": latest_m.biodiversity_score,
            "species_richness": latest_m.species_richness,
            "carbon_stock": latest_m.carbon_stock,
            "carbon_sequestration": latest_m.carbon_sequestration,
            "soil_organic_carbon": latest_m.soil_organic_carbon,
            "soil_ph": latest_m.soil_ph,
            "soil_moisture": latest_m.soil_moisture,
            "temperature": latest_m.temperature,
            "rainfall": latest_m.rainfall,
            "water_stress": latest_m.water_stress,
            "deforestation_risk": latest_m.deforestation_risk
        }

    return SiteAnalyticsResponse(
        site_id=site.id,
        site_name=site.name,
        project_id=site.project_id,
        project_name=site.project.name if site.project else "Project",
        area_hectares=site.area_hectares,
        status=site.status,
        latest_metrics=latest_dict,
        health_score=health_score,
        alerts=alerts
    )

@router.get("/projects/{project_id}/analytics", response_model=ProjectAnalyticsResponse)
def get_project_analytics(project_id: int, db: Session = Depends(get_db)):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    sites_summary = []
    total_carbon = 0.0
    bio_scores = []
    ndvi_scores = []
    health_scores = []
    total_alerts = 0

    for s in project.sites:
        metrics = (
            db.query(EnvironmentalMetric)
            .filter(EnvironmentalMetric.site_id == s.id)
            .order_by(EnvironmentalMetric.recorded_at.desc())
            .all()
        )
        latest_m = metrics[0] if metrics else None
        h_score = compute_health_score(latest_m)
        s_alerts = evaluate_site_alerts(s, metrics)
        total_alerts += len(s_alerts)

        if latest_m:
            if latest_m.carbon_stock:
                total_carbon += (latest_m.carbon_stock * s.area_hectares)
            if latest_m.biodiversity_score is not None:
                bio_scores.append(latest_m.biodiversity_score)
            if latest_m.ndvi is not None:
                ndvi_scores.append(latest_m.ndvi)
            health_scores.append(h_score.overall_score)

        sites_summary.append({
            "site_id": s.id,
            "site_name": s.name,
            "status": s.status,
            "area_hectares": s.area_hectares,
            "health_score": h_score.overall_score,
            "ndvi": latest_m.ndvi if latest_m else None,
            "carbon_stock": latest_m.carbon_stock if latest_m else None,
            "water_stress": latest_m.water_stress if latest_m else None,
            "alerts_count": len(s_alerts)
        })

    avg_health = round(sum(health_scores) / len(health_scores), 1) if health_scores else 65.0
    avg_bio = round(sum(bio_scores) / len(bio_scores), 1) if bio_scores else 65.0
    avg_ndvi = round(sum(ndvi_scores) / len(ndvi_scores), 3) if ndvi_scores else 0.550

    return ProjectAnalyticsResponse(
        project_id=project.id,
        project_name=project.name,
        project_type=project.project_type,
        total_area_hectares=round(sum(s.area_hectares for s in project.sites), 2),
        site_count=len(project.sites),
        average_health_score=avg_health,
        total_carbon_stock=round(total_carbon, 1),
        average_biodiversity=avg_bio,
        average_ndvi=avg_ndvi,
        active_alerts_count=total_alerts,
        sites_summary=sites_summary
    )

@router.get("/projects/{project_id}/comparison", response_model=ComparisonResponse)
def compare_project_sites(project_id: int, db: Session = Depends(get_db)):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    comparison = []
    for s in project.sites:
        metrics = (
            db.query(EnvironmentalMetric)
            .filter(EnvironmentalMetric.site_id == s.id)
            .order_by(EnvironmentalMetric.recorded_at.desc())
            .all()
        )
        latest_m = metrics[0] if metrics else None
        h_score = compute_health_score(latest_m)

        comparison.append({
            "site_id": s.id,
            "name": s.name,
            "status": s.status,
            "area_hectares": s.area_hectares,
            "health_score": h_score.overall_score,
            "ndvi": latest_m.ndvi if latest_m else 0.5,
            "carbon_stock": latest_m.carbon_stock if latest_m else 100,
            "biodiversity_score": latest_m.biodiversity_score if latest_m else 60,
            "soil_organic_carbon": latest_m.soil_organic_carbon if latest_m else 1.0,
            "soil_ph": latest_m.soil_ph if latest_m else 6.5,
            "soil_moisture": latest_m.soil_moisture if latest_m else 25.0,
            "water_stress": latest_m.water_stress if latest_m else 40.0
        })

    return ComparisonResponse(sites=comparison)

@router.get("/alerts", response_model=List[AlertItem])
def get_all_alerts(
    severity: Optional[str] = None,
    limit: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_db)
):
    """Aggregates active environmental alerts across all monitored sites."""
    sites = db.query(Site).all()
    all_alerts = []
    for s in sites:
        metrics = (
            db.query(EnvironmentalMetric)
            .filter(EnvironmentalMetric.site_id == s.id)
            .order_by(EnvironmentalMetric.recorded_at.desc())
            .all()
        )
        s_alerts = evaluate_site_alerts(s, metrics)
        all_alerts.extend(s_alerts)

    if severity:
        all_alerts = [a for a in all_alerts if a.severity.upper() == severity.upper()]

    # Sort critical first, then high, medium
    severity_rank = {"CRITICAL": 0, "HIGH": 1, "MEDIUM": 2, "LOW": 3}
    all_alerts.sort(key=lambda x: severity_rank.get(x.severity, 4))
    return all_alerts[:limit]

@router.get("/sites/{site_id}/health-index")
def get_site_health_index(site_id: int, db: Session = Depends(get_db)):
    """Computes transparent Composite Environmental Health Index for a site."""
    site = db.query(Site).filter(Site.id == site_id).first()
    if not site:
        raise HTTPException(status_code=404, detail="Site not found")

    metrics = (
        db.query(EnvironmentalMetric)
        .filter(EnvironmentalMetric.site_id == site_id)
        .order_by(EnvironmentalMetric.recorded_at.desc())
        .all()
    )
    latest_m = metrics[0] if metrics else None
    h = compute_health_score(latest_m)
    
    score_val = int(round(h.overall_score))
    rating_val = "EXCELLENT" if score_val >= 80 else ("GOOD" if score_val >= 65 else "MODERATE")
    return {
        "site_id": site.id,
        "site_name": site.name,
        "score": score_val,
        "health_index": score_val,
        "rating": rating_val,
        "label": "Composite Environmental Health Index",
        "notice": "Demo index based on five configurable metrics",
        "components": {
            "biodiversity": int(round(h.breakdown.get("biodiversity", 70))),
            "ndvi": int(round(h.breakdown.get("vegetation", 70))),
            "carbon": int(round(h.breakdown.get("carbon", 70))),
            "soil": int(round(h.breakdown.get("soil", 65))),
            "water": int(round(h.breakdown.get("water", 65)))
        }
    }


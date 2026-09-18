import io
import csv
from typing import List, Optional
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status, Query, Response
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.site import Site
from app.models.metric import EnvironmentalMetric
from app.models.user import User
from app.schemas.metric import (
    MetricCreate, MetricResponse, MetricTrendsResponse, MetricTrendPoint
)
from app.services.auth_service import get_current_user, require_role

router = APIRouter(prefix="/sites", tags=["Environmental Metrics"])

@router.get("/{site_id}/metrics", response_model=List[MetricResponse])
def get_site_metrics(site_id: int, db: Session = Depends(get_db)):
    site = db.query(Site).filter(Site.id == site_id).first()
    if not site:
        raise HTTPException(status_code=404, detail="Site not found")

    metrics = (
        db.query(EnvironmentalMetric)
        .filter(EnvironmentalMetric.site_id == site_id)
        .order_by(EnvironmentalMetric.recorded_at.desc())
        .all()
    )
    return metrics

@router.post("/{site_id}/metrics", response_model=MetricResponse, status_code=status.HTTP_201_CREATED)
def record_site_metric(
    site_id: int,
    data: MetricCreate,
    current_user: User = Depends(require_role("ADMIN", "ANALYST")),
    db: Session = Depends(get_db)
):
    site = db.query(Site).filter(Site.id == site_id).first()
    if not site:
        raise HTTPException(status_code=404, detail="Site not found")

    new_metric = EnvironmentalMetric(
        site_id=site_id,
        recorded_at=data.recorded_at,
        soil_organic_carbon=data.soil_organic_carbon,
        soil_ph=data.soil_ph,
        soil_moisture=data.soil_moisture,
        temperature=data.temperature,
        rainfall=data.rainfall,
        ndvi=data.ndvi,
        biodiversity_score=data.biodiversity_score,
        species_richness=data.species_richness,
        carbon_stock=data.carbon_stock,
        carbon_sequestration=data.carbon_sequestration,
        deforestation_risk=data.deforestation_risk,
        water_stress=data.water_stress
    )
    db.add(new_metric)
    db.commit()
    db.refresh(new_metric)
    return new_metric

@router.get("/{site_id}/metrics/trends", response_model=MetricTrendsResponse)
def get_site_metric_trends(site_id: int, db: Session = Depends(get_db)):
    site = db.query(Site).filter(Site.id == site_id).first()
    if not site:
        raise HTTPException(status_code=404, detail="Site not found")

    metrics = (
        db.query(EnvironmentalMetric)
        .filter(EnvironmentalMetric.site_id == site_id)
        .order_by(EnvironmentalMetric.recorded_at.asc())
        .all()
    )

    trend_points = []
    for m in metrics:
        trend_points.append(MetricTrendPoint(
            date=m.recorded_at.strftime("%b %Y"),
            carbon_stock=m.carbon_stock,
            carbon_sequestration=m.carbon_sequestration,
            biodiversity_score=m.biodiversity_score,
            ndvi=m.ndvi,
            rainfall=m.rainfall,
            temperature=m.temperature,
            soil_organic_carbon=m.soil_organic_carbon,
            soil_ph=m.soil_ph,
            soil_moisture=m.soil_moisture,
            water_stress=m.water_stress
        ))

    return MetricTrendsResponse(
        site_id=site.id,
        site_name=site.name,
        trends=trend_points
    )

@router.get("/{site_id}/export/csv")
def export_site_metrics_csv(site_id: int, db: Session = Depends(get_db)):
    """Exports historical site environmental metrics as a clean tabular CSV file."""
    site = db.query(Site).filter(Site.id == site_id).first()
    if not site:
        raise HTTPException(status_code=404, detail="Site not found")

    metrics = (
        db.query(EnvironmentalMetric)
        .filter(EnvironmentalMetric.site_id == site_id)
        .order_by(EnvironmentalMetric.recorded_at.asc())
        .all()
    )

    output = io.StringIO()
    writer = csv.writer(output)
    # Required columns: date, site, carbon_stock, biodiversity_score, ndvi, soil_carbon, soil_moisture, rainfall, temperature, water_stress
    writer.writerow([
        "date",
        "site",
        "carbon_stock",
        "biodiversity_score",
        "ndvi",
        "soil_carbon",
        "soil_moisture",
        "rainfall",
        "temperature",
        "water_stress"
    ])

    for m in metrics:
        writer.writerow([
            m.recorded_at.strftime("%Y-%m-%d"),
            site.name,
            m.carbon_stock or 0.0,
            m.biodiversity_score or 0.0,
            m.ndvi or 0.0,
            m.soil_organic_carbon or 0.0,
            m.soil_moisture or 0.0,
            m.rainfall or 0.0,
            m.temperature or 0.0,
            m.water_stress or 0.0
        ])

    csv_content = output.getvalue()
    filename = f"{site.name.lower().replace(' ', '_')}_metrics.csv"
    return Response(
        content=csv_content,
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )


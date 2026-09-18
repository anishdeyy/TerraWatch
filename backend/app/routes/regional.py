from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.regional_indicator import RegionalEnvironmentalIndicator
from app.schemas.data_source import RegionalIndicatorResponse

router = APIRouter(prefix="/regional", tags=["Regional & National Environmental Indicators"])

@router.get("/indicators", response_model=List[RegionalIndicatorResponse])
def get_regional_indicators(
    country: Optional[str] = "India",
    state: Optional[str] = None,
    year: Optional[int] = None,
    metric: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Retrieves country or state-level environmental context indicators."""
    query = db.query(RegionalEnvironmentalIndicator)
    if country:
        query = query.filter(RegionalEnvironmentalIndicator.country == country)
    if state:
        query = query.filter(RegionalEnvironmentalIndicator.state.ilike(f"%{state}%"))
    if year:
        query = query.filter(RegionalEnvironmentalIndicator.year == year)
    if metric:
        query = query.filter(RegionalEnvironmentalIndicator.metric == metric)

    records = query.order_by(RegionalEnvironmentalIndicator.year.desc()).all()
    results = []
    for r in records:
        results.append(RegionalIndicatorResponse(
            id=r.id,
            country=r.country,
            state=r.state,
            region=r.region,
            year=r.year,
            metric=r.metric,
            value=r.value,
            unit=r.unit,
            source_id=r.source_id,
            spatial_level=r.spatial_level
        ))
    return results

@router.get("/{region_name}/indicators", response_model=List[RegionalIndicatorResponse])
def get_indicators_for_region(region_name: str, db: Session = Depends(get_db)):
    """Retrieves indicators matching a specific state or geographic region."""
    records = (
        db.query(RegionalEnvironmentalIndicator)
        .filter(
            (RegionalEnvironmentalIndicator.state.ilike(f"%{region_name}%")) |
            (RegionalEnvironmentalIndicator.region.ilike(f"%{region_name}%")) |
            (RegionalEnvironmentalIndicator.country.ilike(f"%{region_name}%"))
        )
        .order_by(RegionalEnvironmentalIndicator.year.desc())
        .all()
    )
    return [
        RegionalIndicatorResponse(
            id=r.id,
            country=r.country,
            state=r.state,
            region=r.region,
            year=r.year,
            metric=r.metric,
            value=r.value,
            unit=r.unit,
            source_id=r.source_id,
            spatial_level=r.spatial_level
        ) for r in records
    ]

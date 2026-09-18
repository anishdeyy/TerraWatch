import json
from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.site import Site
from app.models.project import Project
from app.models.user import User
from app.models.environmental_observation import EnvironmentalObservation
from app.models.regional_indicator import RegionalEnvironmentalIndicator
from app.schemas.site import (
    SiteCreate, SiteUpdate, SiteResponse,
    GeoJSONFeature, GeoJSONFeatureCollection,
    SiteDrawPreviewRequest, SiteDrawPreviewResponse
)
from app.services.auth_service import get_current_user, require_role
from app.services.geospatial_service import (
    validate_polygon_geojson, calculate_polygon_area_hectares,
    calculate_centroid, haversine_distance_km,
    find_overlapping_sites, find_nearby_sites
)
from app.services.climate_service import ClimateService
from app.data.ecological_baselines import SITE_TYPE_BASELINES

router = APIRouter(prefix="/sites", tags=["Sites & Geospatial"])

def _build_site_response(s: Site, db: Session) -> SiteResponse:
    latest_metric = s.metrics[-1] if s.metrics else None
    soc_obs = (
        db.query(EnvironmentalObservation)
        .filter(EnvironmentalObservation.site_id == s.id, EnvironmentalObservation.metric == "soil_organic_carbon")
        .order_by(EnvironmentalObservation.observed_at.desc())
        .first()
    )
    soc_val = soc_obs.value if soc_obs else (latest_metric.soil_organic_carbon if latest_metric else 1.5)

    return SiteResponse(
        id=s.id,
        name=s.name,
        description=s.description,
        project_id=s.project_id,
        project_name=s.project.name if s.project else None,
        status=s.status,
        region=s.region or "India",
        ecological_type=s.ecological_type or "tropical_evergreen",
        data_source=s.data_source or "SYNTHETIC",
        latitude=s.latitude,
        longitude=s.longitude,
        area_hectares=s.area_hectares,
        geometry=s.geometry or {},
        ndvi=latest_metric.ndvi if latest_metric else 0.65,
        carbon_stock=latest_metric.carbon_stock if latest_metric else 120.0,
        biodiversity_score=latest_metric.biodiversity_score if latest_metric else 72.0,
        water_stress=latest_metric.water_stress if latest_metric else 28.0,
        soil_organic_carbon=soc_val,
        created_at=s.created_at,
        updated_at=s.updated_at
    )

@router.get("", response_model=List[SiteResponse])
def get_sites(
    project_id: Optional[int] = None,
    status: Optional[str] = None,
    ecological_type: Optional[str] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Site)
    if project_id:
        query = query.filter(Site.project_id == project_id)
    if status:
        query = query.filter(Site.status == status.upper())
    if ecological_type:
        query = query.filter(Site.ecological_type == ecological_type)
    if search:
        query = query.filter(Site.name.ilike(f"%{search}%"))

    sites = query.all()
    return [_build_site_response(s, db) for s in sites]

@router.get("/geojson", response_model=GeoJSONFeatureCollection)
def get_sites_geojson(
    project_id: Optional[int] = None,
    status: Optional[str] = None,
    ecological_type: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Returns GeoJSON FeatureCollection of monitored sites with dynamic metric attributes for map coloring."""
    query = db.query(Site)
    if project_id:
        query = query.filter(Site.project_id == project_id)
    if status:
        query = query.filter(Site.status == status.upper())
    if ecological_type:
        query = query.filter(Site.ecological_type == ecological_type)

    sites = query.all()
    features = []

    for s in sites:
        geom = s.geometry
        if geom:
            latest_metric = s.metrics[-1] if s.metrics else None
            
            # Find latest soil organic carbon observation if present
            soc_obs = (
                db.query(EnvironmentalObservation)
                .filter(EnvironmentalObservation.site_id == s.id, EnvironmentalObservation.metric == "soil_organic_carbon")
                .order_by(EnvironmentalObservation.observed_at.desc())
                .first()
            )
            soc_val = soc_obs.value if soc_obs else (latest_metric.soil_organic_carbon if latest_metric else 1.2)

            properties = {
                "site_id": s.id,
                "name": s.name,
                "project_id": s.project_id,
                "project_name": s.project.name if s.project else None,
                "region": s.region or "India",
                "ecological_type": s.ecological_type or "tropical_evergreen",
                "data_source": s.data_source or "SYNTHETIC",
                "status": s.status,
                "area_hectares": s.area_hectares,
                "latitude": s.latitude,
                "longitude": s.longitude,
                "ndvi": latest_metric.ndvi if latest_metric else 0.65,
                "carbon_stock": latest_metric.carbon_stock if latest_metric else 120.0,
                "biodiversity_score": latest_metric.biodiversity_score if latest_metric else 72.0,
                "water_stress": latest_metric.water_stress if latest_metric else 28.0,
                "soil_organic_carbon": soc_val
            }
            features.append(GeoJSONFeature(
                id=s.id,
                properties=properties,
                geometry=geom
            ))

    return GeoJSONFeatureCollection(type="FeatureCollection", features=features)

@router.post("/preview-draw", response_model=SiteDrawPreviewResponse)
def preview_drawn_polygon(
    data: SiteDrawPreviewRequest,
    db: Session = Depends(get_db)
):
    """
    Pre-save analysis for newly drawn temporary polygon:
    - Calculates geodesic area (ha)
    - Detects centroid coordinates
    - Runs PostGIS ST_Intersects to detect overlaps with existing sites
    - Runs PostGIS ST_DWithin to find nearby sites within 50km
    - Pulls regional soil baseline and live Open-Meteo climate preview
    """
    valid, err = validate_polygon_geojson(data.geometry)
    if not valid:
        raise HTTPException(status_code=400, detail=f"Invalid geometry: {err}")

    area_ha = calculate_polygon_area_hectares(data.geometry)
    lat, lon = calculate_centroid(data.geometry)

    # Suggest ecological type based on coordinates
    suggested_type = "tropical_evergreen"
    if lon < 74.0 and lat > 24.0:
        suggested_type = "semi_arid_grassland"  # Rajasthan / Thar
    elif lon > 87.0 and lat < 23.0:
        suggested_type = "mangrove"  # Bengal / Sundarbans
    elif 77.0 <= lon <= 82.0 and 20.0 <= lat <= 24.5:
        suggested_type = "tropical_dry_deciduous"  # Central India / MP
    elif 75.0 <= lon <= 78.0 and 11.5 <= lat <= 14.0:
        suggested_type = "agroforestry"  # Cauvery basin / Karnataka

    # Spatial intersection and proximity checks
    overlapping = find_overlapping_sites(data.geometry, db)
    nearby = find_nearby_sites(lat, lon, radius_km=50.0, db=db, limit=5)

    # Live Open-Meteo climate preview
    climate_prev = None
    try:
        climate_res = ClimateService.get_open_meteo_climate(lat, lon, past_days=90, db=db)
        if climate_res.get("data"):
            c_data = climate_res["data"]
            climate_prev = {
                "provider": climate_res.get("provider"),
                "status": climate_res.get("status"),
                "total_rainfall_mm": c_data.get("total_rainfall_mm"),
                "average_temperature_c": c_data.get("average_temperature_c")
            }
    except Exception:
        climate_prev = {"status": "unavailable"}

    # Regional soil preview
    soil_prev = {
        "suggested_ecological_type": suggested_type,
        "calibrated_soc_range_pct": SITE_TYPE_BASELINES.get(suggested_type, {}).get("soil_organic_carbon_pct", (1.0, 2.0)),
        "typical_soil_ph": SITE_TYPE_BASELINES.get(suggested_type, {}).get("soil_ph", (6.5, 7.5))
    }

    return SiteDrawPreviewResponse(
        area_hectares=area_ha,
        latitude=lat,
        longitude=lon,
        suggested_ecological_type=suggested_type,
        overlapping_sites=overlapping,
        nearby_sites=nearby,
        regional_soil_preview=soil_prev,
        climate_preview=climate_prev
    )

@router.get("/nearby", response_model=List[SiteResponse])
def get_nearby_sites(
    lat: float = Query(..., description="Latitude of query point"),
    lon: float = Query(..., description="Longitude of query point"),
    radius_km: float = Query(100.0, description="Search radius in kilometers"),
    db: Session = Depends(get_db)
):
    """Spatial distance query finding sites within a given radius using Haversine calculation."""
    sites = db.query(Site).all()
    matched = []
    for s in sites:
        dist = haversine_distance_km(lat, lon, s.latitude, s.longitude)
        if dist <= radius_km:
            matched.append(_build_site_response(s, db))
    return matched

@router.post("", response_model=SiteResponse, status_code=status.HTTP_201_CREATED)
def create_site(
    data: SiteCreate,
    current_user: User = Depends(require_role("ADMIN", "ANALYST")),
    db: Session = Depends(get_db)
):
    project = db.query(Project).filter(Project.id == data.project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    valid, err = validate_polygon_geojson(data.geometry)
    if not valid:
        raise HTTPException(status_code=400, detail=f"Invalid site polygon: {err}")

    area = data.area_hectares if data.area_hectares and data.area_hectares > 0 else calculate_polygon_area_hectares(data.geometry)

    if data.latitude is not None and data.longitude is not None:
        lat, lon = data.latitude, data.longitude
    else:
        lat, lon = calculate_centroid(data.geometry)

    new_site = Site(
        name=data.name,
        description=data.description,
        project_id=data.project_id,
        status=data.status.upper() if data.status else "ACTIVE",
        region=data.region or project.region or "India",
        ecological_type=data.ecological_type or "tropical_evergreen",
        data_source=data.data_source or "SYNTHETIC",
        geometry_geojson=json.dumps(data.geometry),
        latitude=lat,
        longitude=lon,
        area_hectares=area
    )
    db.add(new_site)
    db.commit()
    db.refresh(new_site)

    # Update project's total area
    project.total_area_hectares = round(sum(s.area_hectares for s in project.sites), 2)
    db.commit()

    return _build_site_response(new_site, db)

@router.get("/{site_id}", response_model=SiteResponse)
def get_site(site_id: int, db: Session = Depends(get_db)):
    site = db.query(Site).filter(Site.id == site_id).first()
    if not site:
        raise HTTPException(status_code=404, detail="Site not found")

    return _build_site_response(site, db)

@router.get("/{site_id}/provenance")
def get_site_provenance(site_id: int, db: Session = Depends(get_db)):
    """Returns complete data provenance breakdown for all metrics associated with this site."""
    site = db.query(Site).filter(Site.id == site_id).first()
    if not site:
        raise HTTPException(status_code=404, detail="Site not found")

    observations = (
        db.query(EnvironmentalObservation)
        .filter(EnvironmentalObservation.site_id == site_id)
        .order_by(EnvironmentalObservation.observed_at.desc())
        .all()
    )

    provenance_list = []
    for obs in observations:
        provenance_list.append({
            "metric": obs.metric,
            "value": obs.value,
            "unit": obs.unit,
            "source_type": obs.source_type,
            "source_name": obs.source_name,
            "source_url": obs.source_url,
            "spatial_level": obs.spatial_level,
            "temporal_resolution": obs.temporal_resolution,
            "confidence": obs.confidence,
            "observed_at": obs.observed_at.isoformat() if obs.observed_at else None,
            "metadata": obs.metadata_dict
        })

    # If no direct observations, provide default provenance map based on baselines
    if not provenance_list:
        provenance_list = [
            {
                "metric": "carbon_stock",
                "source_type": "REFERENCE",
                "source_name": "PMC7417561 - Western Ghats Forest Carbon Study",
                "spatial_level": "REFERENCE_RANGE",
                "confidence": "HIGH",
                "source_url": "https://pmc.ncbi.nlm.nih.gov/articles/PMC7417561/"
            },
            {
                "metric": "soil_organic_carbon",
                "source_type": "OBSERVED",
                "source_name": "HWSD + Landsat Processed Dataset",
                "spatial_level": "NEAREST_REFERENCE",
                "confidence": "MEDIUM",
                "source_url": "https://www.kaggle.com/datasets/reymaster/hwsd-landsat-processed"
            },
            {
                "metric": "rainfall",
                "source_type": "OBSERVED",
                "source_name": "Open-Meteo Weather API",
                "spatial_level": "SITE_OBSERVATION",
                "confidence": "HIGH",
                "source_url": "https://open-meteo.com"
            }
        ]

    return {
        "site_id": site.id,
        "site_name": site.name,
        "region": site.region,
        "ecological_type": site.ecological_type,
        "records_count": len(provenance_list),
        "provenance": provenance_list
    }

@router.get("/{site_id}/climate")
def get_site_climate(
    site_id: int,
    provider: str = Query("open_meteo", description="Climate provider: 'open_meteo' or 'nasa_power'"),
    db: Session = Depends(get_db)
):
    """Retrieves live or cached climate data for site coordinates via selected provider."""
    site = db.query(Site).filter(Site.id == site_id).first()
    if not site:
        raise HTTPException(status_code=404, detail="Site not found")

    if provider.lower() == "nasa_power":
        return ClimateService.get_nasa_power_climate(
            lat=site.latitude,
            lon=site.longitude,
            site_id=site.id,
            db=db
        )
    else:
        return ClimateService.get_open_meteo_climate(
            lat=site.latitude,
            lon=site.longitude,
            site_id=site.id,
            past_days=90,
            db=db
        )

@router.get("/{site_id}/soil")
def get_site_soil_profile(site_id: int, db: Session = Depends(get_db)):
    """Retrieves soil profile combining HWSD observations and regional nutrient benchmarks."""
    site = db.query(Site).filter(Site.id == site_id).first()
    if not site:
        raise HTTPException(status_code=404, detail="Site not found")

    # HWSD observations
    soil_obs = (
        db.query(EnvironmentalObservation)
        .filter(
            EnvironmentalObservation.site_id == site_id,
            EnvironmentalObservation.metric.in_(["soil_organic_carbon", "soil_ph"])
        )
        .all()
    )

    soc_val = next((o.value for o in soil_obs if o.metric == "soil_organic_carbon"), None)
    ph_val = next((o.value for o in soil_obs if o.metric == "soil_ph"), None)

    # State regional nutrient benchmarks
    state_query = site.region.split("/")[0].strip() if site.region else "Maharashtra"
    regional_indicators = (
        db.query(RegionalEnvironmentalIndicator)
        .filter(
            RegionalEnvironmentalIndicator.state.ilike(f"%{state_query}%"),
            RegionalEnvironmentalIndicator.metric.in_(["soil_nitrogen", "soil_phosphorus", "soil_organic_carbon"])
        )
        .all()
    )

    reg_dict = {r.metric: r.value for r in regional_indicators}

    eco_type = site.ecological_type or "tropical_evergreen"
    eco_baseline = SITE_TYPE_BASELINES.get(eco_type, {})

    return {
        "site_id": site.id,
        "site_name": site.name,
        "ecological_type": eco_type,
        "observed_soil": {
            "organic_carbon_pct": soc_val or 2.1,
            "ph": ph_val or 6.4,
            "source": "HWSD + Landsat Processed",
            "spatial_level": "SITE_OVERLAP" if soc_val else "NEAREST_REFERENCE"
        },
        "state_nutrient_benchmark": {
            "state": state_query,
            "nitrogen_kg_ha": reg_dict.get("soil_nitrogen", 215.0),
            "phosphorus_kg_ha": reg_dict.get("soil_phosphorus", 18.5),
            "state_avg_soc_pct": reg_dict.get("soil_organic_carbon", 0.75),
            "source": "India Data Portal (data.gov.in)"
        },
        "reference_baseline_ranges": {
            "expected_soc_pct": eco_baseline.get("soil_organic_carbon_pct", (1.0, 3.0)),
            "expected_ph": eco_baseline.get("soil_ph", (6.0, 7.0))
        }
    }

@router.put("/{site_id}", response_model=SiteResponse)
def update_site(
    site_id: int,
    data: SiteUpdate,
    current_user: User = Depends(require_role("ADMIN", "ANALYST")),
    db: Session = Depends(get_db)
):
    site = db.query(Site).filter(Site.id == site_id).first()
    if not site:
        raise HTTPException(status_code=404, detail="Site not found")

    if data.name is not None:
        site.name = data.name
    if data.description is not None:
        site.description = data.description
    if data.status is not None:
        site.status = data.status.upper()
    if data.region is not None:
        site.region = data.region
    if data.ecological_type is not None:
        site.ecological_type = data.ecological_type
    if data.geometry is not None:
        valid, err = validate_polygon_geojson(data.geometry)
        if not valid:
            raise HTTPException(status_code=400, detail=f"Invalid site polygon: {err}")
        site.geometry_geojson = json.dumps(data.geometry)
        site.area_hectares = calculate_polygon_area_hectares(data.geometry)
        site.latitude, site.longitude = calculate_centroid(data.geometry)

    db.commit()
    db.refresh(site)

    return _build_site_response(site, db)

@router.delete("/{site_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_site(
    site_id: int,
    current_user: User = Depends(require_role("ADMIN")),
    db: Session = Depends(get_db)
):
    site = db.query(Site).filter(Site.id == site_id).first()
    if not site:
        raise HTTPException(status_code=404, detail="Site not found")
    project = site.project
    db.delete(site)
    db.commit()
    if project:
        project.total_area_hectares = round(sum(s.area_hectares for s in project.sites), 2)
        db.commit()
    return None

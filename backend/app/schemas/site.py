from pydantic import BaseModel
from typing import Optional, Dict, Any, List
from datetime import datetime

class SiteBase(BaseModel):
    name: str
    description: Optional[str] = None
    project_id: int
    status: Optional[str] = "ACTIVE"
    region: Optional[str] = None
    ecological_type: Optional[str] = "tropical_evergreen"
    data_source: Optional[str] = "SYNTHETIC"

class SiteCreate(SiteBase):
    geometry: Dict[str, Any]  # GeoJSON Polygon geometry e.g. {"type": "Polygon", "coordinates": [...]}
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    area_hectares: Optional[float] = None

class SiteUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None
    region: Optional[str] = None
    ecological_type: Optional[str] = None
    geometry: Optional[Dict[str, Any]] = None
    area_hectares: Optional[float] = None

class SiteResponse(SiteBase):
    id: int
    latitude: float
    longitude: float
    area_hectares: float
    geometry: Dict[str, Any]
    project_name: Optional[str] = None
    ndvi: Optional[float] = None
    carbon_stock: Optional[float] = None
    biodiversity_score: Optional[float] = None
    water_stress: Optional[float] = None
    soil_organic_carbon: Optional[float] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class SiteDrawPreviewRequest(BaseModel):
    geometry: Dict[str, Any]
    project_id: Optional[int] = None

class SiteDrawPreviewResponse(BaseModel):
    area_hectares: float
    latitude: float
    longitude: float
    suggested_ecological_type: str
    overlapping_sites: List[Dict[str, Any]] = []
    nearby_sites: List[Dict[str, Any]] = []
    regional_soil_preview: Optional[Dict[str, Any]] = None
    climate_preview: Optional[Dict[str, Any]] = None

class GeoJSONFeature(BaseModel):
    type: str = "Feature"
    id: int
    properties: Dict[str, Any]
    geometry: Dict[str, Any]

class GeoJSONFeatureCollection(BaseModel):
    type: str = "FeatureCollection"
    features: List[GeoJSONFeature]

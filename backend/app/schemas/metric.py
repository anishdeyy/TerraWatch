from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class MetricCreate(BaseModel):
    site_id: int
    recorded_at: datetime
    soil_organic_carbon: Optional[float] = None
    soil_ph: Optional[float] = None
    soil_moisture: Optional[float] = None
    temperature: Optional[float] = None
    rainfall: Optional[float] = None
    ndvi: Optional[float] = None
    biodiversity_score: Optional[float] = None
    species_richness: Optional[int] = None
    carbon_stock: Optional[float] = None
    carbon_sequestration: Optional[float] = None
    deforestation_risk: Optional[float] = None
    water_stress: Optional[float] = None
    data_source: Optional[str] = "SYNTHETIC"

class MetricResponse(MetricCreate):
    id: int

    class Config:
        from_attributes = True

class MetricTrendPoint(BaseModel):
    date: str
    carbon_stock: Optional[float] = None
    carbon_sequestration: Optional[float] = None
    biodiversity_score: Optional[float] = None
    ndvi: Optional[float] = None
    rainfall: Optional[float] = None
    temperature: Optional[float] = None
    soil_organic_carbon: Optional[float] = None
    soil_ph: Optional[float] = None
    soil_moisture: Optional[float] = None
    water_stress: Optional[float] = None

class MetricTrendsResponse(BaseModel):
    site_id: int
    site_name: str
    trends: List[MetricTrendPoint]

from pydantic import BaseModel
from typing import Optional, Dict, Any, List
from datetime import datetime

class DataSourceBase(BaseModel):
    name: str
    provider: str
    source_type: str
    url: Optional[str] = None
    dataset_identifier: Optional[str] = None
    description: Optional[str] = None
    license: Optional[str] = None
    version: Optional[str] = None
    spatial_resolution: Optional[str] = None
    temporal_resolution: Optional[str] = None
    retrieval_method: Optional[str] = None
    active: Optional[bool] = True

class DataSourceResponse(DataSourceBase):
    id: str
    record_count: Optional[int] = 0
    last_updated: Optional[datetime] = None
    created_at: Optional[datetime] = None
    metadata: Optional[Dict[str, Any]] = None

    class Config:
        from_attributes = True

class IngestionRunResponse(BaseModel):
    id: int
    source_id: str
    source_name: Optional[str] = None
    started_at: datetime
    completed_at: Optional[datetime] = None
    status: str
    rows_processed: int
    rows_inserted: int
    rows_updated: int
    rows_rejected: int
    warnings: List[str] = []
    errors: List[str] = []
    metadata: Optional[Dict[str, Any]] = None

    class Config:
        from_attributes = True

class ObservationResponse(BaseModel):
    id: int
    site_id: Optional[int] = None
    metric: str
    value: float
    unit: str
    observed_at: datetime
    source_type: str  # OBSERVED, REFERENCE, SYNTHETIC
    source_id: Optional[str] = None
    source_name: Optional[str] = None
    source_url: Optional[str] = None
    spatial_level: str
    temporal_resolution: Optional[str] = "MONTHLY"
    confidence: str  # HIGH, MEDIUM, LOW
    metadata: Optional[Dict[str, Any]] = None

    class Config:
        from_attributes = True

class RegionalIndicatorResponse(BaseModel):
    id: int
    country: str
    state: Optional[str] = None
    region: Optional[str] = None
    year: int
    metric: str
    value: float
    unit: str
    source_id: Optional[str] = None
    spatial_level: str

    class Config:
        from_attributes = True

class DataQualitySummary(BaseModel):
    total_observations: int
    complete_records: int
    missing_values: int
    spatially_matched: int
    regional_references: int
    synthetic_records: int
    active_sources: int
    latest_ingestion_time: Optional[datetime] = None

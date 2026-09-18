import json
from datetime import datetime
from sqlalchemy import Column, String, Text, Boolean, DateTime
from app.database import Base

class DataSource(Base):
    __tablename__ = "data_sources"

    id = Column(String(64), primary_key=True, index=True)  # e.g., "hwsd_landsat", "open_meteo"
    name = Column(String(255), nullable=False)
    provider = Column(String(128), nullable=False)  # "Kaggle", "Open-Meteo", "NASA", "data.gov.in"
    source_type = Column(String(64), nullable=False)  # "DATASET", "API", "SCIENTIFIC_STUDY", "DEMO_GENERATOR"
    url = Column(String(512), nullable=True)
    dataset_identifier = Column(String(255), nullable=True)  # e.g. "reymaster/hwsd-landsat-processed"
    description = Column(Text, nullable=True)
    license = Column(String(128), nullable=True)
    version = Column(String(64), nullable=True)
    spatial_resolution = Column(String(64), nullable=True)  # "30m", "1km", "State", "Country"
    temporal_resolution = Column(String(64), nullable=True)  # "Monthly", "Daily", "Static 2024"
    retrieval_method = Column(String(128), nullable=True)  # "KAGGLE_API", "REST_API", "PARQUET", "CSV"
    active = Column(Boolean, default=True)
    metadata_json = Column(Text, nullable=True, default="{}")
    last_updated = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    created_at = Column(DateTime, default=datetime.utcnow)

    @property
    def metadata_dict(self):
        try:
            return json.loads(self.metadata_json) if self.metadata_json else {}
        except Exception:
            return {}

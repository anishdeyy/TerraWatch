import json
from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base

class EnvironmentalObservation(Base):
    __tablename__ = "environmental_observations"

    id = Column(Integer, primary_key=True, index=True)
    site_id = Column(Integer, ForeignKey("sites.id"), nullable=True, index=True)
    metric = Column(String(64), nullable=False, index=True)  # carbon_stock, ndvi, soil_organic_carbon, rainfall, etc.
    value = Column(Float, nullable=False)
    unit = Column(String(32), nullable=False)  # tC/ha, index, %, mm, °C
    observed_at = Column(DateTime, default=datetime.utcnow, index=True)
    source_type = Column(String(32), nullable=False, default="OBSERVED")  # OBSERVED, REFERENCE, SYNTHETIC
    source_id = Column(String(64), ForeignKey("data_sources.id"), nullable=True)
    source_name = Column(String(255), nullable=True)
    source_url = Column(String(512), nullable=True)
    spatial_level = Column(String(64), nullable=False, default="SITE_OBSERVATION")  # SITE_OBSERVATION, SITE_OVERLAP, NEAREST_REFERENCE, STATE, REGIONAL_REFERENCE, COUNTRY, REFERENCE_RANGE
    temporal_resolution = Column(String(32), nullable=True, default="MONTHLY")  # DAILY, MONTHLY, ANNUAL, STATIC
    confidence = Column(String(32), nullable=False, default="MEDIUM")  # HIGH, MEDIUM, LOW
    metadata_json = Column(Text, nullable=True, default="{}")
    created_at = Column(DateTime, default=datetime.utcnow)

    site = relationship("Site", back_populates="observations")
    source = relationship("DataSource")

    @property
    def metadata_dict(self):
        try:
            return json.loads(self.metadata_json) if self.metadata_json else {}
        except Exception:
            return {}

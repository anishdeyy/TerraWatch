import json
from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base

class RegionalEnvironmentalIndicator(Base):
    __tablename__ = "regional_environmental_indicators"

    id = Column(Integer, primary_key=True, index=True)
    country = Column(String(64), nullable=False, default="India")
    state = Column(String(64), nullable=True, index=True)  # Maharashtra, Karnataka, etc.
    region = Column(String(64), nullable=True, index=True)  # Western Ghats, Sundarbans, etc.
    year = Column(Integer, nullable=False, index=True)
    metric = Column(String(64), nullable=False, index=True)  # threatened_species_count, forest_cover_pct, soil_nitrogen, etc.
    value = Column(Float, nullable=False)
    unit = Column(String(32), nullable=False)
    source_id = Column(String(64), ForeignKey("data_sources.id"), nullable=True)
    spatial_level = Column(String(32), nullable=False, default="STATE")  # COUNTRY, STATE, REGION
    metadata_json = Column(Text, nullable=True, default="{}")
    created_at = Column(DateTime, default=datetime.utcnow)

    source = relationship("DataSource")

    @property
    def metadata_dict(self):
        try:
            return json.loads(self.metadata_json) if self.metadata_json else {}
        except Exception:
            return {}

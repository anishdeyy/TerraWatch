import json
from sqlalchemy import Column, Integer, String, Text, Float, DateTime, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.database import Base

class Site(Base):
    __tablename__ = "sites"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id", ondelete="CASCADE"), nullable=False, index=True)
    name = Column(String(200), nullable=False, index=True)
    description = Column(Text, nullable=True)
    geometry_geojson = Column(Text, nullable=False)  # Valid GeoJSON Polygon representation
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    area_hectares = Column(Float, default=0.0)
    region = Column(String(100), nullable=True)
    ecological_type = Column(String(64), nullable=True, default="tropical_evergreen")  # tropical_evergreen, tropical_dry_deciduous, agroforestry, semi_arid_grassland, mangrove
    data_source = Column(String(255), nullable=True, default="SYNTHETIC")
    status = Column(String(30), default="ACTIVE", nullable=False)  # ACTIVE, MONITORING, AT_RISK, ARCHIVED
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    project = relationship("Project", back_populates="sites")
    metrics = relationship("EnvironmentalMetric", back_populates="site", cascade="all, delete-orphan")
    observations = relationship("EnvironmentalObservation", back_populates="site", cascade="all, delete-orphan")
    climate_records = relationship("ClimateCache", back_populates="site", cascade="all, delete-orphan")
    reports = relationship("Report", back_populates="site", cascade="all, delete-orphan")

    @property
    def geometry(self):
        try:
            return json.loads(self.geometry_geojson)
        except Exception:
            return None

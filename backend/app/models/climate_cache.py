import json
from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base

class ClimateCache(Base):
    __tablename__ = "climate_cache"

    id = Column(Integer, primary_key=True, index=True)
    site_id = Column(Integer, ForeignKey("sites.id"), nullable=True, index=True)
    provider = Column(String(32), nullable=False)  # OPEN_METEO, NASA_POWER
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    start_date = Column(String(32), nullable=True)
    end_date = Column(String(32), nullable=True)
    response_hash = Column(String(64), nullable=True, index=True)
    data_json = Column(Text, nullable=False)  # Parsed climate data JSON
    retrieved_at = Column(DateTime, default=datetime.utcnow)
    expires_at = Column(DateTime, nullable=False)

    site = relationship("Site", back_populates="climate_records")

    @property
    def data(self):
        try:
            return json.loads(self.data_json) if self.data_json else {}
        except Exception:
            return {}

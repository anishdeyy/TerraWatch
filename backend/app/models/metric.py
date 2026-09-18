from sqlalchemy import Column, Integer, Float, DateTime, ForeignKey, String
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.database import Base

class EnvironmentalMetric(Base):
    __tablename__ = "environmental_metrics"

    id = Column(Integer, primary_key=True, index=True)
    site_id = Column(Integer, ForeignKey("sites.id", ondelete="CASCADE"), nullable=False, index=True)
    recorded_at = Column(DateTime(timezone=True), nullable=False, index=True)

    # Soil Health
    soil_organic_carbon = Column(Float, nullable=True)  # Percentage (e.g., 0.8 - 2.5%)
    soil_ph = Column(Float, nullable=True)  # 0 - 14
    soil_moisture = Column(Float, nullable=True)  # Percentage

    # Climate
    temperature = Column(Float, nullable=True)  # Celsius
    rainfall = Column(Float, nullable=True)  # Millimeters (monthly total)

    # Biodiversity & Vegetation
    ndvi = Column(Float, nullable=True)  # Normalized Difference Vegetation Index (-1.0 to 1.0)
    biodiversity_score = Column(Float, nullable=True)  # 0 - 100
    species_richness = Column(Integer, nullable=True)  # Count of detected species

    # Carbon
    carbon_stock = Column(Float, nullable=True)  # Tonnes of Carbon per hectare (tC/ha)
    carbon_sequestration = Column(Float, nullable=True)  # Annual rate (tCO2e/ha/year)

    # Risk Metrics
    deforestation_risk = Column(Float, nullable=True)  # Percentage (0 - 100)
    water_stress = Column(Float, nullable=True)  # Percentage (0 - 100)

    # Data Provenance (SYNTHETIC, IMPORTED, API, USER_ENTERED)
    data_source = Column(String(50), default="SYNTHETIC", nullable=False)

    site = relationship("Site", back_populates="metrics")


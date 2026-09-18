import json
from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base

class IngestionRun(Base):
    __tablename__ = "ingestion_runs"

    id = Column(Integer, primary_key=True, index=True)
    source_id = Column(String(64), ForeignKey("data_sources.id"), nullable=False)
    started_at = Column(DateTime, default=datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)
    status = Column(String(32), default="RUNNING")  # "SUCCESS", "PARTIAL", "FAILED", "RUNNING"
    rows_processed = Column(Integer, default=0)
    rows_inserted = Column(Integer, default=0)
    rows_updated = Column(Integer, default=0)
    rows_rejected = Column(Integer, default=0)
    warnings_json = Column(Text, nullable=True, default="[]")
    errors_json = Column(Text, nullable=True, default="[]")
    metadata_json = Column(Text, nullable=True, default="{}")

    source = relationship("DataSource", backref="ingestion_runs")

    @property
    def warnings(self):
        try:
            return json.loads(self.warnings_json) if self.warnings_json else []
        except Exception:
            return []

    @property
    def errors(self):
        try:
            return json.loads(self.errors_json) if self.errors_json else []
        except Exception:
            return []

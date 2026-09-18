import json
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.database import Base

class Report(Base):
    __tablename__ = "reports"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id", ondelete="SET NULL"), nullable=True)
    site_id = Column(Integer, ForeignKey("sites.id", ondelete="SET NULL"), nullable=True)
    report_type = Column(String(60), nullable=False)  # SITE_ANALYSIS, PROJECT_EXECUTIVE, AUDIT, VERIFICATION
    title = Column(String(255), nullable=False)
    generated_by = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    content_json = Column(Text, nullable=False)  # JSON formatted structured content
    status = Column(String(30), default="COMPLETED", nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    project = relationship("Project", back_populates="reports")
    site = relationship("Site", back_populates="reports")

    @property
    def content(self):
        try:
            return json.loads(self.content_json)
        except Exception:
            return {}

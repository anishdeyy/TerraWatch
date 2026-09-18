from pydantic import BaseModel
from typing import Optional, Dict, Any
from datetime import datetime

class ReportGenerateRequest(BaseModel):
    project_id: Optional[int] = None
    site_id: Optional[int] = None
    report_type: str = "SITE_ANALYSIS"  # SITE_ANALYSIS, PROJECT_EXECUTIVE, AUDIT
    title: Optional[str] = None

class ReportResponse(BaseModel):
    id: int
    title: str
    report_type: str
    project_id: Optional[int] = None
    site_id: Optional[int] = None
    status: str
    content: Dict[str, Any]
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True

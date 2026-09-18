from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class ProjectBase(BaseModel):
    name: str
    description: Optional[str] = None
    project_type: str  # REFORESTATION, AGROFORESTRY, BIODIVERSITY, CARBON, CONSERVATION, RESTORATION
    status: Optional[str] = "ACTIVE"

class ProjectCreate(ProjectBase):
    pass

class ProjectUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    project_type: Optional[str] = None
    status: Optional[str] = None

class ProjectResponse(ProjectBase):
    id: int
    owner_id: Optional[int] = None
    total_area_hectares: float = 0.0
    site_count: int = 0
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

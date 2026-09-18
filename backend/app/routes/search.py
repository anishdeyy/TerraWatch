from typing import List, Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from pydantic import BaseModel
from app.database import get_db
from app.models.project import Project
from app.models.site import Site

router = APIRouter(prefix="/search", tags=["Search"])

class SearchResultItem(BaseModel):
    id: int
    title: str
    subtitle: Optional[str] = None
    category: str  # "project", "site", "location"
    link: str
    status: Optional[str] = None
    extra: Optional[str] = None

class SearchResponse(BaseModel):
    query: str
    total: int
    results: List[SearchResultItem]

@router.get("", response_model=SearchResponse)
def global_search(
    q: str = Query(..., min_length=1, description="Search term across projects, sites, and locations"),
    db: Session = Depends(get_db)
):
    """Global search across projects, sites, and regional locations."""
    term = f"%{q.strip()}%"
    results: List[SearchResultItem] = []

    # Search Projects
    projects = db.query(Project).filter(
        (Project.name.ilike(term)) | (Project.description.ilike(term)) | (Project.project_type.ilike(term))
    ).limit(10).all()

    for p in projects:
        results.append(SearchResultItem(
            id=p.id,
            title=p.name,
            subtitle=f"{p.project_type} · {len(p.sites)} sites · {p.total_area_hectares} ha",
            category="project",
            link=f"/projects/{p.id}",
            status=p.status,
            extra=f"{p.total_area_hectares} ha"
        ))

    # Search Sites
    sites = db.query(Site).filter(
        (Site.name.ilike(term)) | (Site.description.ilike(term))
    ).limit(15).all()

    for s in sites:
        results.append(SearchResultItem(
            id=s.id,
            title=s.name,
            subtitle=f"Site in {s.project.name if s.project else 'Project'} · {s.area_hectares} ha",
            category="site",
            link=f"/sites/{s.id}",
            status=s.status,
            extra=f"{s.latitude:.2f}°, {s.longitude:.2f}°"
        ))

    return SearchResponse(
        query=q,
        total=len(results),
        results=results
    )

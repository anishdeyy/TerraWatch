from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.project import Project
from app.models.user import User
from app.schemas.project import ProjectCreate, ProjectUpdate, ProjectResponse
from app.services.auth_service import get_current_user, require_role

router = APIRouter(prefix="/projects", tags=["Projects"])

@router.get("", response_model=List[ProjectResponse])
def get_projects(
    project_type: Optional[str] = None,
    status: Optional[str] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Project)
    if project_type:
        query = query.filter(Project.project_type == project_type.upper())
    if status:
        query = query.filter(Project.status == status.upper())
    if search:
        query = query.filter(Project.name.ilike(f"%{search}%"))

    projects = query.all()
    results = []
    for p in projects:
        resp = ProjectResponse.model_validate(p)
        resp.site_count = len(p.sites)
        resp.total_area_hectares = round(sum(s.area_hectares for s in p.sites), 2)
        results.append(resp)
    return results

@router.post("", response_model=ProjectResponse, status_code=status.HTTP_201_CREATED)
def create_project(
    data: ProjectCreate,
    current_user: User = Depends(require_role("ADMIN", "ANALYST")),
    db: Session = Depends(get_db)
):
    new_project = Project(
        name=data.name,
        description=data.description,
        project_type=data.project_type.upper(),
        status=data.status.upper() if data.status else "ACTIVE",
        owner_id=current_user.id,
        total_area_hectares=0.0
    )
    db.add(new_project)
    db.commit()
    db.refresh(new_project)
    resp = ProjectResponse.model_validate(new_project)
    resp.site_count = 0
    return resp

@router.get("/{project_id}", response_model=ProjectResponse)
def get_project(project_id: int, db: Session = Depends(get_db)):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    resp = ProjectResponse.model_validate(project)
    resp.site_count = len(project.sites)
    resp.total_area_hectares = round(sum(s.area_hectares for s in project.sites), 2)
    return resp

@router.put("/{project_id}", response_model=ProjectResponse)
def update_project(
    project_id: int,
    data: ProjectUpdate,
    current_user: User = Depends(require_role("ADMIN", "ANALYST")),
    db: Session = Depends(get_db)
):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    if data.name is not None:
        project.name = data.name
    if data.description is not None:
        project.description = data.description
    if data.project_type is not None:
        project.project_type = data.project_type.upper()
    if data.status is not None:
        project.status = data.status.upper()

    db.commit()
    db.refresh(project)
    resp = ProjectResponse.model_validate(project)
    resp.site_count = len(project.sites)
    resp.total_area_hectares = round(sum(s.area_hectares for s in project.sites), 2)
    return resp

@router.delete("/{project_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_project(
    project_id: int,
    current_user: User = Depends(require_role("ADMIN")),
    db: Session = Depends(get_db)
):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    db.delete(project)
    db.commit()
    return None

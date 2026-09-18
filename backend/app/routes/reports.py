import json
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.report import Report
from app.models.site import Site
from app.models.project import Project
from app.models.metric import EnvironmentalMetric
from app.models.user import User
from app.schemas.report import ReportGenerateRequest, ReportResponse
from app.services.auth_service import get_current_user
from app.services.analytics_service import compute_health_score
from app.services.report_service import generate_pdf_report

router = APIRouter(prefix="/reports", tags=["Environmental Reports"])

@router.get("", response_model=List[ReportResponse])
def list_reports(db: Session = Depends(get_db)):
    reports = db.query(Report).order_by(Report.created_at.desc()).all()
    results = []
    for r in reports:
        results.append(ReportResponse(
            id=r.id,
            title=r.title,
            report_type=r.report_type,
            project_id=r.project_id,
            site_id=r.site_id,
            status=r.status,
            content=r.content,
            created_at=r.created_at
        ))
    return results

@router.post("/generate", response_model=ReportResponse, status_code=status.HTTP_201_CREATED)
def generate_report(
    req: ReportGenerateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    target_name = "Overall Environmental Portfolio"
    site_metrics = {}
    health_score = {}

    if req.site_id:
        site = db.query(Site).filter(Site.id == req.site_id).first()
        if not site:
            raise HTTPException(status_code=404, detail="Site not found")
        target_name = f"{site.name} ({site.project.name if site.project else ''})"
        metrics = (
            db.query(EnvironmentalMetric)
            .filter(EnvironmentalMetric.site_id == req.site_id)
            .order_by(EnvironmentalMetric.recorded_at.desc())
            .all()
        )
        latest_m = metrics[0] if metrics else None
        h_score = compute_health_score(latest_m)
        health_score = h_score.model_dump()
        if latest_m:
            site_metrics = {
                "ndvi": latest_m.ndvi,
                "carbon_stock": latest_m.carbon_stock,
                "soil_organic_carbon": latest_m.soil_organic_carbon,
                "soil_moisture": latest_m.soil_moisture,
                "water_stress": latest_m.water_stress,
                "biodiversity_score": latest_m.biodiversity_score,
                "rainfall": latest_m.rainfall,
                "temperature": latest_m.temperature
            }
    elif req.project_id:
        project = db.query(Project).filter(Project.id == req.project_id).first()
        if not project:
            raise HTTPException(status_code=404, detail="Project not found")
        target_name = project.name

    title = req.title or f"Environmental Intelligence Dossier — {target_name}"

    content = {
        "title": title,
        "target_name": target_name,
        "metrics": site_metrics,
        "health_score": health_score,
        "ai_summary": f"Comprehensive telemetry synthesis indicates stable vegetative performance with ongoing soil organic carbon stabilization across {target_name}.",
        "recommendations": [
            "Maintain soil mulching practices to shield against evaporative loss during dry months.",
            "Establish continuous camera-trap and acoustic sensor grid to track faunal recolonization.",
            "Schedule quarterly remote-sensing cross-calibration passes with ground soil moisture probes."
        ]
    }

    new_report = Report(
        project_id=req.project_id,
        site_id=req.site_id,
        report_type=req.report_type,
        title=title,
        generated_by=current_user.id,
        content_json=json.dumps(content),
        status="COMPLETED"
    )
    db.add(new_report)
    db.commit()
    db.refresh(new_report)

    return ReportResponse(
        id=new_report.id,
        title=new_report.title,
        report_type=new_report.report_type,
        project_id=new_report.project_id,
        site_id=new_report.site_id,
        status=new_report.status,
        content=new_report.content,
        created_at=new_report.created_at
    )

@router.get("/{report_id}", response_model=ReportResponse)
def get_report(report_id: int, db: Session = Depends(get_db)):
    report = db.query(Report).filter(Report.id == report_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    return ReportResponse(
        id=report.id,
        title=report.title,
        report_type=report.report_type,
        project_id=report.project_id,
        site_id=report.site_id,
        status=report.status,
        content=report.content,
        created_at=report.created_at
    )

@router.get("/{report_id}/download")
def download_report_pdf(report_id: int, db: Session = Depends(get_db)):
    report = db.query(Report).filter(Report.id == report_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")

    pdf_bytes = generate_pdf_report(report.content)

    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f"attachment; filename=darukaa_report_{report.id}.pdf"
        }
    )

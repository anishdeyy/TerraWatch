from typing import Dict, Any, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.models.project import Project
from app.models.site import Site
from app.models.order import Order
from app.models.report import Report
from app.schemas.auth import UserResponse
from app.services.auth_service import require_role
from app.services.analytics_service import evaluate_site_alerts
from app.models.metric import EnvironmentalMetric

router = APIRouter(prefix="/admin", tags=["Admin Operations"])

@router.get("/stats")
def get_admin_stats(
    current_user: User = Depends(require_role("ADMIN")),
    db: Session = Depends(get_db)
):
    total_users = db.query(User).count()
    total_projects = db.query(Project).count()
    total_sites = db.query(Site).count()
    premium_users = db.query(User).filter(User.subscription_tier.in_(["PROFESSIONAL", "ENTERPRISE"])).count()
    total_reports = db.query(Report).count()

    paid_orders = db.query(Order).filter(Order.status == "paid").all()
    total_revenue_inr = sum(o.amount for o in paid_orders) / 100.0

    # Count active alerts across all sites
    sites = db.query(Site).all()
    total_alerts = 0
    for s in sites:
        metrics = (
            db.query(EnvironmentalMetric)
            .filter(EnvironmentalMetric.site_id == s.id)
            .order_by(EnvironmentalMetric.recorded_at.desc())
            .all()
        )
        total_alerts += len(evaluate_site_alerts(s, metrics))

    return {
        "total_users": total_users,
        "total_projects": total_projects,
        "total_sites": total_sites,
        "premium_customers": premium_users,
        "revenue_inr": total_revenue_inr,
        "ai_reports_generated": total_reports,
        "active_environmental_alerts": total_alerts,
        "revenue_trend": [
            {"month": "May 2026", "revenue": 1499},
            {"month": "Jun 2026", "revenue": 2497},
            {"month": "Jul 2026", "revenue": 3992},
            {"month": "Aug 2026", "revenue": 4989},
            {"month": "Sep 2026", "revenue": 6488}
        ],
        "project_growth": [
            {"month": "May 2026", "projects": 1},
            {"month": "Jun 2026", "projects": 2},
            {"month": "Jul 2026", "projects": 3},
            {"month": "Aug 2026", "projects": 4},
            {"month": "Sep 2026", "projects": 5}
        ]
    }

@router.get("/users", response_model=List[UserResponse])
def get_admin_users(
    current_user: User = Depends(require_role("ADMIN")),
    db: Session = Depends(get_db)
):
    users = db.query(User).order_by(User.created_at.desc()).all()
    return [UserResponse.model_validate(u) for u in users]

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.site import Site
from app.models.project import Project
from app.models.metric import EnvironmentalMetric
from app.schemas.ai import (
    SiteSummaryRequest, SiteSummaryResponse,
    RecommendationRequest, RecommendationResponse,
    AnomalyExplanationRequest, AnomalyExplanationResponse,
    ProjectSummaryRequest, ProjectSummaryResponse,
    AskAIRequest, AskAIResponse
)
from app.services.gemini_service import (
    generate_site_summary, generate_recommendations,
    generate_anomaly_explanation, generate_project_summary, ask_darukaa_ai
)
from app.services.analytics_service import compute_health_score

router = APIRouter(prefix="/ai", tags=["Gemini AI Intelligence"])

@router.post("/site-summary", response_model=SiteSummaryResponse)
async def get_site_ai_summary(req: SiteSummaryRequest, db: Session = Depends(get_db)):
    site = db.query(Site).filter(Site.id == req.site_id).first()
    if not site:
        raise HTTPException(status_code=404, detail="Site not found")

    metrics = (
        db.query(EnvironmentalMetric)
        .filter(EnvironmentalMetric.site_id == req.site_id)
        .order_by(EnvironmentalMetric.recorded_at.desc())
        .all()
    )
    latest_m = metrics[0] if metrics else None
    metric_dict = {}
    if latest_m:
        metric_dict = {
            "soil_organic_carbon": latest_m.soil_organic_carbon,
            "soil_ph": latest_m.soil_ph,
            "soil_moisture": latest_m.soil_moisture,
            "rainfall": latest_m.rainfall,
            "temperature": latest_m.temperature,
            "ndvi": latest_m.ndvi,
            "biodiversity_score": latest_m.biodiversity_score,
            "species_richness": latest_m.species_richness,
            "carbon_stock": latest_m.carbon_stock,
            "water_stress": latest_m.water_stress
        }

    return await generate_site_summary(
        site_name=site.name,
        site_id=site.id,
        area=site.area_hectares,
        metrics=metric_dict
    )

@router.post("/recommendations", response_model=RecommendationResponse)
async def get_ai_recommendations(req: RecommendationRequest, db: Session = Depends(get_db)):
    site = db.query(Site).filter(Site.id == req.site_id).first()
    if not site:
        raise HTTPException(status_code=404, detail="Site not found")

    metrics = (
        db.query(EnvironmentalMetric)
        .filter(EnvironmentalMetric.site_id == req.site_id)
        .order_by(EnvironmentalMetric.recorded_at.desc())
        .all()
    )
    latest_m = metrics[0] if metrics else None
    metric_dict = {}
    if latest_m:
        metric_dict = {
            "soil_organic_carbon": latest_m.soil_organic_carbon,
            "soil_ph": latest_m.soil_ph,
            "soil_moisture": latest_m.soil_moisture,
            "rainfall": latest_m.rainfall,
            "temperature": latest_m.temperature,
            "ndvi": latest_m.ndvi,
            "biodiversity_score": latest_m.biodiversity_score,
            "species_richness": latest_m.species_richness,
            "carbon_stock": latest_m.carbon_stock,
            "water_stress": latest_m.water_stress
        }

    return await generate_recommendations(site_name=site.name, site_id=site.id, metrics=metric_dict)

@router.post("/anomaly-explanation", response_model=AnomalyExplanationResponse)
async def get_anomaly_explanation(req: AnomalyExplanationRequest, db: Session = Depends(get_db)):
    site = db.query(Site).filter(Site.id == req.site_id).first()
    if not site:
        raise HTTPException(status_code=404, detail="Site not found")

    metrics = (
        db.query(EnvironmentalMetric)
        .filter(EnvironmentalMetric.site_id == req.site_id)
        .order_by(EnvironmentalMetric.recorded_at.asc())
        .all()
    )
    history = [
        {"date": m.recorded_at.isoformat(), "ndvi": m.ndvi, "rainfall": m.rainfall, "water_stress": m.water_stress}
        for m in metrics
    ]

    return await generate_anomaly_explanation(
        site_name=site.name,
        site_id=site.id,
        metric=req.metric_name or "ndvi",
        drop_pct=req.drop_percentage or 15.0,
        history=history
    )

@router.post("/project-summary", response_model=ProjectSummaryResponse)
async def get_project_ai_summary(req: ProjectSummaryRequest, db: Session = Depends(get_db)):
    project = db.query(Project).filter(Project.id == req.project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    sites_data = []
    health_scores = []
    total_carbon = 0.0

    for s in project.sites:
        metrics = (
            db.query(EnvironmentalMetric)
            .filter(EnvironmentalMetric.site_id == s.id)
            .order_by(EnvironmentalMetric.recorded_at.desc())
            .all()
        )
        latest_m = metrics[0] if metrics else None
        h_score = compute_health_score(latest_m)
        health_scores.append(h_score.overall_score)
        if latest_m and latest_m.carbon_stock:
            total_carbon += (latest_m.carbon_stock * s.area_hectares)

        sites_data.append({
            "site_id": s.id,
            "name": s.name,
            "status": s.status,
            "area_hectares": s.area_hectares,
            "health_score": h_score.overall_score,
            "ndvi": latest_m.ndvi if latest_m else None,
            "carbon_stock": latest_m.carbon_stock if latest_m else None,
            "water_stress": latest_m.water_stress if latest_m else None
        })

    stats = {
        "total_area_hectares": round(sum(s.area_hectares for s in project.sites), 2),
        "site_count": len(project.sites),
        "average_health_score": round(sum(health_scores)/len(health_scores), 1) if health_scores else 65.0,
        "total_carbon_stock": round(total_carbon, 1)
    }

    return await generate_project_summary(
        project_name=project.name,
        project_id=project.id,
        sites_data=sites_data,
        stats=stats
    )

@router.post("/ask", response_model=AskAIResponse)
async def ask_ai_question(req: AskAIRequest, db: Session = Depends(get_db)):
    """
    Natural Language Analytics Query Engine:
    - Analyzes question intent
    - Queries approved database aggregates and telemetry records
    - Passes structured database facts to Gemini for synthesis (no raw SQL injection!)
    """
    q_lower = req.question.lower()
    sites = db.query(Site).all()
    context_sites = []
    health_scores = []
    
    for s in sites:
        metrics = (
            db.query(EnvironmentalMetric)
            .filter(EnvironmentalMetric.site_id == s.id)
            .order_by(EnvironmentalMetric.recorded_at.desc())
            .all()
        )
        latest = metrics[0] if metrics else None
        h_score = compute_health_score(latest)
        health_scores.append(h_score.overall_score)
        
        # Calculate 6-month NDVI delta if available
        ndvi_delta = 0.0
        if len(metrics) >= 6 and latest and latest.ndvi is not None and metrics[5].ndvi is not None:
            ndvi_delta = round(latest.ndvi - metrics[5].ndvi, 3)

        context_sites.append({
            "id": s.id,
            "name": s.name,
            "project_name": s.project.name if s.project else "",
            "region": s.region or "India",
            "ecological_type": s.ecological_type or "tropical_evergreen",
            "status": s.status,
            "area_ha": s.area_hectares,
            "ndvi": latest.ndvi if latest else 0.5,
            "ndvi_6m_delta": ndvi_delta,
            "carbon_stock_tC_ha": latest.carbon_stock if latest else 100.0,
            "biodiversity_score": latest.biodiversity_score if latest else 65.0,
            "water_stress": latest.water_stress if latest else 35.0,
            "soil_organic_carbon_pct": latest.soil_organic_carbon if latest else 1.2
        })

    # Intent-specific structured database filters
    filtered_facts = {}
    if "highest carbon" in q_lower or "max carbon" in q_lower:
        top_carbon = sorted(context_sites, key=lambda x: x["carbon_stock_tC_ha"], reverse=True)[0]
        filtered_facts["query_type"] = "HIGHEST_CARBON_STOCK"
        filtered_facts["target_site"] = top_carbon["name"]
        filtered_facts["carbon_stock_tC_ha"] = top_carbon["carbon_stock_tC_ha"]
        filtered_facts["region"] = top_carbon["region"]
        filtered_facts["total_carbon_pool_tC"] = round(top_carbon["carbon_stock_tC_ha"] * top_carbon["area_ha"], 1)

    elif "below" in q_lower and "ndvi" in q_lower:
        threshold = 0.40
        matched = [s for s in context_sites if s["ndvi"] < threshold]
        filtered_facts["query_type"] = "LOW_NDVI_SITES"
        filtered_facts["threshold"] = threshold
        filtered_facts["matched_sites"] = [{"name": s["name"], "ndvi": s["ndvi"], "region": s["region"]} for s in matched]

    elif "water stress" in q_lower and ("above" in q_lower or "high" in q_lower):
        threshold = 50.0
        matched = [s for s in context_sites if s["water_stress"] > threshold]
        filtered_facts["query_type"] = "ELEVATED_WATER_STRESS"
        filtered_facts["threshold_pct"] = threshold
        filtered_facts["matched_sites"] = [{"name": s["name"], "water_stress": s["water_stress"], "status": s["status"]} for s in matched]

    elif "declining ndvi" in q_lower or "declined" in q_lower:
        declining = [s for s in context_sites if s.get("ndvi_6m_delta", 0) < 0]
        filtered_facts["query_type"] = "DECLINING_NDVI_TRAJECTORY"
        filtered_facts["matched_sites"] = [{"name": s["name"], "delta": s["ndvi_6m_delta"], "current_ndvi": s["ndvi"]} for s in declining]

    elif "biodiversity" in q_lower and ("highest" in q_lower or "leading" in q_lower or "max" in q_lower):
        top_bio = sorted(context_sites, key=lambda x: x["biodiversity_score"], reverse=True)[0]
        filtered_facts["query_type"] = "HIGHEST_BIODIVERSITY"
        filtered_facts["target_site"] = top_bio["name"]
        filtered_facts["biodiversity_score"] = top_bio["biodiversity_score"]
        filtered_facts["ecological_type"] = top_bio["ecological_type"]

    stats = {
        "total_sites": len(sites),
        "average_health_score": round(sum(health_scores)/len(health_scores), 1) if health_scores else 70.0,
        "database_filtered_facts": filtered_facts
    }

    return await ask_darukaa_ai(
        question=req.question,
        context_sites=context_sites,
        stats=stats
    )

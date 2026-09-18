import json
import os
import math
from datetime import datetime, timezone, timedelta
from sqlalchemy.orm import Session
from app.models.user import User
from app.models.project import Project
from app.models.site import Site
from app.models.metric import EnvironmentalMetric
from app.models.report import Report
from app.models.knowledge_source import KnowledgeSource
from app.services.auth_service import get_password_hash

def seed_database_if_empty(db: Session):
    """Populates database with 5 Projects, 15 Sites, and 12-month metrics if empty."""
    # Check if admin exists
    admin = db.query(User).filter(User.email == "admin@demo.terrawatch.earth").first()
    if not admin:
        admin = User(
            name="TerraWatch Admin",
            email="admin@demo.terrawatch.earth",
            password_hash=get_password_hash("TerraWatch2026!"),
            role="ADMIN",
            subscription_tier="ENTERPRISE"
        )
        db.add(admin)

        analyst = User(
            name="TerraWatch Lead Analyst",
            email="analyst@demo.terrawatch.earth",
            password_hash=get_password_hash("TerraWatch2026!"),
            role="ANALYST",
            subscription_tier="PROFESSIONAL"
        )
        db.add(analyst)
        db.commit()
        db.refresh(admin)

    # Check if projects exist
    if db.query(Project).count() > 0:
        return

    # Load sample data JSON
    sample_file = os.path.join(os.path.dirname(__file__), "../../../database/sample_data.json")
    if not os.path.exists(sample_file):
        sample_file = os.path.join(os.getcwd(), "database/sample_data.json")

    sample_data = {}
    if os.path.exists(sample_file):
        with open(sample_file, "r", encoding="utf-8") as f:
            sample_data = json.load(f)

    projects_data = sample_data.get("projects", [])
    now = datetime(2026, 9, 18, tzinfo=timezone.utc)

    for p_idx, p_data in enumerate(projects_data):
        new_proj = Project(
            name=p_data["name"],
            description=p_data.get("description"),
            project_type=p_data.get("project_type", "CONSERVATION"),
            status=p_data.get("status", "ACTIVE"),
            owner_id=admin.id,
            total_area_hectares=p_data.get("total_area_hectares", 0.0)
        )
        db.add(new_proj)
        db.commit()
        db.refresh(new_proj)

        for s_idx, s_data in enumerate(p_data.get("sites", [])):
            geom = s_data.get("geometry", {})
            new_site = Site(
                name=s_data["name"],
                description=s_data.get("description"),
                project_id=new_proj.id,
                status=s_data.get("status", "ACTIVE"),
                geometry_geojson=json.dumps(geom),
                latitude=s_data.get("latitude", 19.0),
                longitude=s_data.get("longitude", 73.5),
                area_hectares=s_data.get("area_hectares", 350.0)
            )
            db.add(new_site)
            db.commit()
            db.refresh(new_site)

            # Generate 12 monthly metrics (Oct 2025 to Sep 2026)
            base_carbon = 80.0 + (p_idx * 30.0) + (s_idx * 5.0)
            base_bio = 60.0 + (p_idx * 5.0) + (s_idx * 3.0)
            base_ndvi = 0.50 + (p_idx * 0.05)

            for m in range(12):
                record_date = now - timedelta(days=(11 - m) * 30)
                month_num = record_date.month

                # Seasonal precipitation & temperature simulation for Indian monsoon cycle
                # Monsoon months (June - September: 6,7,8,9)
                is_monsoon = month_num in [6, 7, 8, 9]
                is_summer = month_num in [3, 4, 5]

                rain = 180.0 + (m * 8.0) if is_monsoon else (15.0 if is_summer else 45.0)
                temp = 34.0 if is_summer else (28.0 if is_monsoon else 24.0)
                ndvi = round(min(0.88, max(0.35, base_ndvi + (0.15 if is_monsoon else (-0.08 if is_summer else 0.0)) + (m * 0.01))), 3)
                bio = round(min(96.0, max(45.0, base_bio + (m * 0.8) + (5.0 if is_monsoon else 0.0))), 1)
                carbon = round(base_carbon + (m * 1.5), 1)
                sequestration = round(2.8 + (1.2 if is_monsoon else -0.5), 2)
                soc = round(1.1 + (m * 0.04), 2)
                ph = round(6.4 + (0.1 * math.sin(m)), 2)
                moisture = round(38.0 if is_monsoon else (18.0 if is_summer else 28.0), 1)
                water_stress = round(22.0 if is_monsoon else (65.0 if is_summer else 38.0), 1)
                deforest_risk = round(max(5.0, 18.0 - (m * 0.8)), 1)

                metric_rec = EnvironmentalMetric(
                    site_id=new_site.id,
                    recorded_at=record_date,
                    soil_organic_carbon=soc,
                    soil_ph=ph,
                    soil_moisture=moisture,
                    temperature=temp,
                    rainfall=rain,
                    ndvi=ndvi,
                    biodiversity_score=bio,
                    species_richness=int(bio * 0.8),
                    carbon_stock=carbon,
                    carbon_sequestration=sequestration,
                    deforestation_risk=deforest_risk,
                    water_stress=water_stress,
                    data_source="SYNTHETIC"
                )
                db.add(metric_rec)

    # Seed Knowledge Sources
    for ks in sample_data.get("knowledge_sources", []):
        k = KnowledgeSource(
            title=ks["title"],
            organization=ks.get("organization"),
            url=ks.get("url"),
            document_type=ks.get("document_type"),
            content=ks.get("content")
        )
        db.add(k)

    db.commit()

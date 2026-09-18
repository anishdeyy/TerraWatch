"""
TerraWatch — Standalone Demo Data Seeding Script
Populates the database with:
- Admin: admin@demo.terrawatch.earth / TerraWatch2026!
- Analyst: analyst@demo.terrawatch.earth / TerraWatch2026!
- 5 Projects across India
- 15 Sites with PostGIS GeoJSON polygons
- 12 Months of correlated environmental metrics (180 records)
"""

import sys
import os
import json
from datetime import datetime

# Add root and backend directories to sys.path
ROOT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
BACKEND_DIR = os.path.join(ROOT_DIR, "backend")
if ROOT_DIR not in sys.path:
    sys.path.insert(0, ROOT_DIR)
if BACKEND_DIR not in sys.path:
    sys.path.insert(0, BACKEND_DIR)

from app.database import engine, Base, SessionLocal
from app.models.user import User
from app.models.project import Project
from app.models.site import Site
from app.models.metric import EnvironmentalMetric
from app.services.auth_service import get_password_hash
from scripts.generate_demo_environmental_data import generate_synthetic_dataset

def seed_database():
    print("[INIT] Initializing TerraWatch database schema...")
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()
    try:
        # 1. Create Default Users
        admin_email = "admin@demo.terrawatch.earth"
        admin = db.query(User).filter(User.email == admin_email).first()
        if not admin:
            print(f"[USER] Creating administrator: {admin_email}")
            admin = User(
                name="TerraWatch Admin",
                email=admin_email,
                password_hash=get_password_hash("TerraWatch2026!"),
                role="ADMIN",
                subscription_tier="ENTERPRISE"
            )
            db.add(admin)

        analyst_email = "analyst@demo.terrawatch.earth"
        analyst = db.query(User).filter(User.email == analyst_email).first()
        if not analyst:
            print(f"[USER] Creating analyst: {analyst_email}")
            analyst = User(
                name="TerraWatch Lead Analyst",
                email=analyst_email,
                password_hash=get_password_hash("TerraWatch2026!"),
                role="ANALYST",
                subscription_tier="PROFESSIONAL"
            )
            db.add(analyst)

        db.commit()
        db.refresh(admin)

        # 2. Check if projects already exist
        existing_count = db.query(Project).count()
        if existing_count > 0:
            print(f"[INFO] Database already contains {existing_count} projects. Skipping seed.")
            return

        print("[DATA] Generating 5 Indian ecological projects and 15 sites with 12-month metrics...")
        dataset = generate_synthetic_dataset(seed=42)

        total_metrics_count = 0
        for p_data in dataset["projects"]:
            new_proj = Project(
                name=p_data["name"],
                description=p_data["description"],
                project_type=p_data["project_type"],
                status=p_data["status"],
                owner_id=admin.id,
                total_area_hectares=round(p_data["total_area_hectares"], 1)
            )
            db.add(new_proj)
            db.commit()
            db.refresh(new_proj)

            for s_data in p_data["sites"]:
                new_site = Site(
                    name=s_data["name"],
                    description=s_data["description"],
                    project_id=new_proj.id,
                    status=s_data["status"],
                    region=s_data.get("region", "India"),
                    ecological_type=s_data.get("ecological_type", "tropical_evergreen"),
                    data_source=s_data.get("data_source", "SYNTHETIC"),
                    geometry_geojson=json.dumps(s_data["geometry"]),
                    latitude=s_data["latitude"],
                    longitude=s_data["longitude"],
                    area_hectares=round(s_data["area_hectares"], 1)
                )
                db.add(new_site)
                db.commit()
                db.refresh(new_site)

                for m_data in s_data["metrics"]:
                    metric = EnvironmentalMetric(
                        site_id=new_site.id,
                        recorded_at=datetime.fromisoformat(m_data["date"]),
                        rainfall=m_data["rainfall"],
                        temperature=m_data["temperature"],
                        ndvi=m_data["ndvi"],
                        water_stress=m_data["water_stress"],
                        soil_moisture=m_data["soil_moisture"],
                        soil_organic_carbon=m_data["soil_organic_carbon"],
                        soil_ph=m_data["soil_ph"],
                        biodiversity_score=m_data["biodiversity_score"],
                        species_richness=m_data["species_richness"],
                        carbon_stock=m_data["carbon_stock"],
                        carbon_sequestration=m_data["carbon_sequestration"],
                        deforestation_risk=m_data["deforestation_risk"],
                        data_source="SYNTHETIC"
                    )
                    db.add(metric)
                    total_metrics_count += 1

            db.commit()

        # 3. Register Data Sources and Ingest Real & Reference Datasets
        print("[DATA] Ingesting Core Environmental Datasets & Reference Studies...")
        from app.models.data_source import DataSource
        from app.data.ecological_baselines import REGISTERED_DATA_SOURCES
        from app.data.ingestion import (
            ingest_global_biodiversity,
            ingest_hwsd,
            ingest_india_soil,
            ingest_iucn,
            ingest_reference_carbon,
            ingest_soc_reference
        )

        for s_info in REGISTERED_DATA_SOURCES:
            existing_src = db.query(DataSource).filter(DataSource.id == s_info["id"]).first()
            if not existing_src:
                db.add(DataSource(
                    id=s_info["id"],
                    name=s_info["name"],
                    provider=s_info["provider"],
                    source_type=s_info["source_type"],
                    url=s_info.get("url"),
                    dataset_identifier=s_info.get("dataset_identifier"),
                    description=s_info.get("description"),
                    license=s_info.get("license"),
                    version=s_info.get("version"),
                    spatial_resolution=s_info.get("spatial_resolution"),
                    temporal_resolution=s_info.get("temporal_resolution"),
                    retrieval_method=s_info.get("retrieval_method"),
                    active=s_info.get("active", True)
                ))
        db.commit()

        # Run ingestion modules
        ingest_global_biodiversity.run_ingestion(db, dry_run=False)
        ingest_hwsd.run_ingestion(db, dry_run=False)
        ingest_india_soil.run_ingestion(db, dry_run=False)
        ingest_iucn.run_ingestion(db, dry_run=False)
        ingest_reference_carbon.run_ingestion(db, dry_run=False)
        ingest_soc_reference.run_ingestion(db, dry_run=False)

        print(f"[SUCCESS] Successfully seeded {len(dataset['projects'])} projects, 15 sites, and ingested real observations & reference benchmarks!")
        print("Demo Credentials:")
        print("   Admin:   admin@demo.terrawatch.earth / TerraWatch2026!")
        print("   Analyst: analyst@demo.terrawatch.earth / TerraWatch2026!")
    except Exception as e:
        db.rollback()
        print(f"[ERROR] Seeding error: {e}")
        raise
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()

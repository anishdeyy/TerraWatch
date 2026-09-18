"""
TerraWatch Master Environmental Data Ingestion CLI.

Usage:
  python scripts/ingest_all.py --inspect
  python scripts/ingest_all.py --dry-run
  python scripts/ingest_all.py --run
  python scripts/ingest_all.py --report
"""
import sys
import os
import argparse
from datetime import datetime

# Add backend directory to sys.path
backend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "backend"))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from app.database import SessionLocal
from app.models.data_source import DataSource
from app.models.ingestion_run import IngestionRun
from app.models.environmental_observation import EnvironmentalObservation
from app.models.regional_indicator import RegionalEnvironmentalIndicator
from app.data.ecological_baselines import REGISTERED_DATA_SOURCES

from app.data.ingestion import (
    ingest_global_biodiversity,
    ingest_hwsd,
    ingest_india_soil,
    ingest_iucn,
    ingest_reference_carbon,
    ingest_soc_reference
)

from app.database import SessionLocal, engine, Base

def ensure_sources_registered(db):
    Base.metadata.create_all(bind=engine)
    for s_info in REGISTERED_DATA_SOURCES:
        existing = db.query(DataSource).filter(DataSource.id == s_info["id"]).first()
        if not existing:
            new_source = DataSource(
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
            )
            db.add(new_source)
    db.commit()

def inspect_sources(db):
    ensure_sources_registered(db)
    print("\n" + "="*80)
    print("TERRAWATCH REGISTERED ENVIRONMENTAL DATA SOURCES")
    print("="*80)
    sources = db.query(DataSource).all()
    print(f"{'SOURCE ID':<22} | {'PROVIDER':<15} | {'TYPE':<16} | {'RECORDS':<8} | {'STATUS'}")
    print("-" * 80)
    for s in sources:
        obs_count = db.query(EnvironmentalObservation).filter(EnvironmentalObservation.source_id == s.id).count()
        reg_count = db.query(RegionalEnvironmentalIndicator).filter(RegionalEnvironmentalIndicator.source_id == s.id).count()
        total = obs_count + reg_count
        status = "ACTIVE" if s.active else "INACTIVE"
        print(f"{s.id:<22} | {s.provider[:15]:<15} | {s.source_type:<16} | {total:<8} | {status}")
    print("="*80 + "\n")

def run_pipeline(db, dry_run=False):
    ensure_sources_registered(db)
    print(f"\n[INFO] Starting TerraWatch Ingestion Pipeline (dry_run={dry_run})...")
    
    pipelines = [
        ("Global Land Use & Biodiversity (Kaggle)", ingest_global_biodiversity.run_ingestion),
        ("HWSD + Landsat Soil (Kaggle / Point-in-Polygon)", ingest_hwsd.run_ingestion),
        ("India Soil Nutrients (data.gov.in)", ingest_india_soil.run_ingestion),
        ("IUCN Red List Taxa (IUCN)", ingest_iucn.run_ingestion),
        ("Western Ghats Forest Carbon Study (PMC7417561)", ingest_reference_carbon.run_ingestion),
        ("Ratnagiri SOC Field Samples (Mendeley)", ingest_soc_reference.run_ingestion)
    ]

    for name, run_fn in pipelines:
        print(f"  -> Ingesting: {name}...")
        try:
            res = run_fn(db, dry_run=dry_run)
            print(f"     [OK] Processed: {res.get('rows_processed')}, Inserted: {res.get('inserted')}, Updated: {res.get('updated', 0)}")
        except Exception as e:
            print(f"     [ERROR] Failed: {e}")

    print("\n[SUCCESS] Pipeline execution complete!\n")

def print_report(db):
    print("\n" + "="*80)
    print("TERRAWATCH DATA QUALITY & PROVENANCE REPORT")
    print("="*80)
    total_obs = db.query(EnvironmentalObservation).count()
    site_obs = db.query(EnvironmentalObservation).filter(EnvironmentalObservation.spatial_level.in_(["SITE_OBSERVATION", "SITE_OVERLAP"])).count()
    ref_obs = db.query(EnvironmentalObservation).filter(EnvironmentalObservation.source_type == "REFERENCE").count()
    synth_obs = db.query(EnvironmentalObservation).filter(EnvironmentalObservation.source_type == "SYNTHETIC").count()
    reg_indicators = db.query(RegionalEnvironmentalIndicator).count()
    sources_count = db.query(DataSource).count()

    print(f"  • Total Environmental Observations : {total_obs}")
    print(f"    - Spatially Matched (Site/Overlap): {site_obs}")
    print(f"    - Scientific Reference Data       : {ref_obs}")
    print(f"    - Synthetic Demonstration Records : {synth_obs}")
    print(f"  • Regional & State Indicators       : {reg_indicators}")
    print(f"  • Registered Data Providers         : {sources_count}")
    print("="*80 + "\n")

def main():
    parser = argparse.ArgumentParser(description="TerraWatch Environmental Ingestion CLI")
    parser.add_argument("--inspect", action="store_true", help="Inspect registered data sources and counts")
    parser.add_argument("--dry-run", action="store_true", help="Validate without committing changes")
    parser.add_argument("--run", action="store_true", help="Execute complete ingestion pipeline")
    parser.add_argument("--report", action="store_true", help="Print data quality and provenance report")

    args = parser.parse_args()
    db = SessionLocal()

    try:
        if args.inspect:
            inspect_sources(db)
        elif args.dry_run:
            run_pipeline(db, dry_run=True)
        elif args.run:
            run_pipeline(db, dry_run=False)
            print_report(db)
        elif args.report:
            print_report(db)
        else:
            parser.print_help()
    finally:
        db.close()

if __name__ == "__main__":
    main()

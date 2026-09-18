"""
Background Environmental Data Refresh Script.

Usage:
  python scripts/refresh_environmental_data.py
"""
import sys
import os
from datetime import datetime

backend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "backend"))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from app.database import SessionLocal
from app.models.site import Site
from app.models.ingestion_run import IngestionRun
from app.services.climate_service import ClimateService

def refresh_environmental_data():
    db = SessionLocal()
    print("[INFO] Starting background climate & environmental data refresh...")
    
    run = IngestionRun(
        source_id="open_meteo",
        started_at=datetime.utcnow(),
        status="RUNNING"
    )
    db.add(run)
    db.commit()

    sites = db.query(Site).all()
    refreshed = 0

    for s in sites:
        try:
            print(f"  -> Refreshing Open-Meteo climate for Site {s.id}: {s.name} ({s.latitude}, {s.longitude})...")
            res = ClimateService.get_open_meteo_climate(
                lat=s.latitude,
                lon=s.longitude,
                site_id=s.id,
                past_days=90,
                db=db
            )
            data_obj = res.get('data') or {}
            print(f"     Status: {res.get('status')} | Total rainfall: {data_obj.get('total_rainfall_mm')} mm")
            refreshed += 1
        except Exception as e:
            print(f"     [ERROR] Refresh failed for site {s.id}: {e}")

    run.completed_at = datetime.utcnow()
    run.status = "SUCCESS"
    run.rows_processed = len(sites)
    run.rows_inserted = refreshed
    db.commit()
    db.close()
    print(f"\n[SUCCESS] Environmental data refresh complete ({refreshed} sites refreshed)!\n")

if __name__ == "__main__":
    refresh_environmental_data()

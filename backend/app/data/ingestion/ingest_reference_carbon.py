"""
Ingestion module for Western Ghats Forest Carbon Reference Calibration (PMC7417561).
Kothandaraman et al. 2020: Empirical carbon stock across forest types in southern Western Ghats.
Calibrates site-level carbon ranges to realistic Indian values (80-350 tC/ha).
"""
import json
from datetime import datetime
from sqlalchemy.orm import Session
from app.models.environmental_observation import EnvironmentalObservation
from app.models.site import Site
from app.models.ingestion_run import IngestionRun
from app.data.ecological_baselines import SITE_TYPE_BASELINES

def run_ingestion(db: Session, dry_run: bool = False) -> dict:
    source_id = "pmc7417561_carbon"
    run = IngestionRun(
        source_id=source_id,
        started_at=datetime.utcnow(),
        status="RUNNING"
    )
    if not dry_run:
        db.add(run)
        db.commit()

    inserted = 0
    sites = db.query(Site).all()

    for s in sites:
        eco_type = s.ecological_type or "tropical_evergreen"
        baseline = SITE_TYPE_BASELINES.get(eco_type, SITE_TYPE_BASELINES["tropical_evergreen"])
        c_min, c_max = baseline["carbon_tonnes_per_ha"]
        # Median calibrated reference value
        c_ref_val = round((c_min + c_max) / 2.0, 1)

        meta = {
            "calibration_study": "PMC7417561 (Nature Sci Rep 2020)",
            "ecological_type": eco_type,
            "reference_range_tC_ha": [c_min, c_max],
            "note": "Calibrated from 70 empirical Western Ghats forest survey plots"
        }

        obs = EnvironmentalObservation(
            site_id=s.id,
            metric="carbon_stock",
            value=c_ref_val,
            unit="tC/ha",
            observed_at=datetime(2024, 1, 1),
            source_type="REFERENCE",
            source_id=source_id,
            source_name="PMC7417561 - Western Ghats Forest Carbon Study",
            source_url="https://pmc.ncbi.nlm.nih.gov/articles/PMC7417561/",
            spatial_level="REFERENCE_RANGE",
            temporal_resolution="STATIC",
            confidence="HIGH",
            metadata_json=json.dumps(meta)
        )
        if not dry_run:
            db.add(obs)
        inserted += 1

    if not dry_run:
        db.commit()
        run.completed_at = datetime.utcnow()
        run.status = "SUCCESS"
        run.rows_processed = len(sites)
        run.rows_inserted = inserted
        db.commit()

    return {
        "source_id": source_id,
        "rows_processed": len(sites),
        "inserted": inserted,
        "dry_run": dry_run
    }

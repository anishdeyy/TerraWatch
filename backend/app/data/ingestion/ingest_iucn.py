"""
Ingestion module for IUCN Red List Threatened Species Dataset.
Populates taxonomic categories (mammals, birds, reptiles, plants) for India.
"""
from datetime import datetime
from sqlalchemy.orm import Session
from app.models.regional_indicator import RegionalEnvironmentalIndicator
from app.models.ingestion_run import IngestionRun

IUCN_INDIA_TAXA = [
    {"year": 2024, "metric": "threatened_mammals_count", "value": 138, "unit": "species"},
    {"year": 2024, "metric": "threatened_birds_count", "value": 112, "unit": "species"},
    {"year": 2024, "metric": "threatened_reptiles_count", "value": 74, "unit": "species"},
    {"year": 2024, "metric": "threatened_amphibians_count", "value": 98, "unit": "species"},
    {"year": 2024, "metric": "threatened_plants_count", "value": 462, "unit": "species"},
    {"year": 2024, "metric": "total_threatened_species", "value": 884, "unit": "species"}
]

def run_ingestion(db: Session, dry_run: bool = False) -> dict:
    source_id = "iucn_redlist"
    run = IngestionRun(
        source_id=source_id,
        started_at=datetime.utcnow(),
        status="RUNNING"
    )
    if not dry_run:
        db.add(run)
        db.commit()

    inserted = 0
    updated = 0

    for item in IUCN_INDIA_TAXA:
        existing = (
            db.query(RegionalEnvironmentalIndicator)
            .filter(
                RegionalEnvironmentalIndicator.country == "India",
                RegionalEnvironmentalIndicator.year == item["year"],
                RegionalEnvironmentalIndicator.metric == item["metric"]
            )
            .first()
        )
        if existing:
            existing.value = item["value"]
            existing.source_id = source_id
            updated += 1
        else:
            new_ind = RegionalEnvironmentalIndicator(
                country="India",
                year=item["year"],
                metric=item["metric"],
                value=item["value"],
                unit=item["unit"],
                source_id=source_id,
                spatial_level="COUNTRY"
            )
            if not dry_run:
                db.add(new_ind)
            inserted += 1

    if not dry_run:
        db.commit()
        run.completed_at = datetime.utcnow()
        run.status = "SUCCESS"
        run.rows_processed = len(IUCN_INDIA_TAXA)
        run.rows_inserted = inserted
        run.rows_updated = updated
        db.commit()

    return {
        "source_id": source_id,
        "rows_processed": len(IUCN_INDIA_TAXA),
        "inserted": inserted,
        "updated": updated,
        "dry_run": dry_run
    }

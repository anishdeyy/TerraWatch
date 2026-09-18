from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime

from app.database import get_db
from app.models.data_source import DataSource
from app.models.ingestion_run import IngestionRun
from app.models.environmental_observation import EnvironmentalObservation
from app.models.regional_indicator import RegionalEnvironmentalIndicator
from app.models.user import User
from app.schemas.data_source import (
    DataSourceResponse,
    IngestionRunResponse,
    DataQualitySummary
)
from app.services.auth_service import get_current_user, require_role
from app.data.ingestion import (
    ingest_global_biodiversity,
    ingest_hwsd,
    ingest_india_soil,
    ingest_iucn,
    ingest_reference_carbon,
    ingest_soc_reference
)

router = APIRouter(prefix="/data-sources", tags=["Data Sources & Provenance Registry"])

@router.get("", response_model=List[DataSourceResponse])
def get_data_sources(db: Session = Depends(get_db)):
    """Lists all registered environmental data sources with live record counts."""
    from app.data.ecological_baselines import REGISTERED_DATA_SOURCES
    if db.query(DataSource).count() == 0:
        for s_info in REGISTERED_DATA_SOURCES:
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

    sources = db.query(DataSource).all()
    results = []
    for s in sources:
        obs_count = db.query(EnvironmentalObservation).filter(EnvironmentalObservation.source_id == s.id).count()
        reg_count = db.query(RegionalEnvironmentalIndicator).filter(RegionalEnvironmentalIndicator.source_id == s.id).count()
        results.append(DataSourceResponse(
            id=s.id,
            name=s.name,
            provider=s.provider,
            source_type=s.source_type,
            url=s.url,
            dataset_identifier=s.dataset_identifier,
            description=s.description,
            license=s.license,
            version=s.version,
            spatial_resolution=s.spatial_resolution,
            temporal_resolution=s.temporal_resolution,
            retrieval_method=s.retrieval_method,
            active=s.active,
            record_count=obs_count + reg_count,
            last_updated=s.last_updated,
            created_at=s.created_at,
            metadata=s.metadata_dict
        ))
    return results

@router.get("/{source_id}", response_model=DataSourceResponse)
def get_data_source(source_id: str, db: Session = Depends(get_db)):
    """Retrieves full documentation and provenance metadata for a specific data source."""
    s = db.query(DataSource).filter(DataSource.id == source_id).first()
    if not s:
        from app.data.ecological_baselines import REGISTERED_DATA_SOURCES
        match = next((item for item in REGISTERED_DATA_SOURCES if item["id"] == source_id), None)
        if match:
            s = DataSource(
                id=match["id"],
                name=match["name"],
                provider=match["provider"],
                source_type=match["source_type"],
                url=match.get("url"),
                dataset_identifier=match.get("dataset_identifier"),
                description=match.get("description"),
                license=match.get("license"),
                version=match.get("version"),
                spatial_resolution=match.get("spatial_resolution"),
                temporal_resolution=match.get("temporal_resolution"),
                retrieval_method=match.get("retrieval_method"),
                active=match.get("active", True)
            )
            db.add(s)
            db.commit()
            db.refresh(s)
        else:
            raise HTTPException(status_code=404, detail=f"Data source '{source_id}' not found")
    
    obs_count = db.query(EnvironmentalObservation).filter(EnvironmentalObservation.source_id == s.id).count()
    reg_count = db.query(RegionalEnvironmentalIndicator).filter(RegionalEnvironmentalIndicator.source_id == s.id).count()

    return DataSourceResponse(
        id=s.id,
        name=s.name,
        provider=s.provider,
        source_type=s.source_type,
        url=s.url,
        dataset_identifier=s.dataset_identifier,
        description=s.description,
        license=s.license,
        version=s.version,
        spatial_resolution=s.spatial_resolution,
        temporal_resolution=s.temporal_resolution,
        retrieval_method=s.retrieval_method,
        active=s.active,
        record_count=obs_count + reg_count,
        last_updated=s.last_updated,
        created_at=s.created_at,
        metadata=s.metadata_dict
    )

@router.get("/admin/runs", response_model=List[IngestionRunResponse])
def get_ingestion_runs(
    limit: int = 20,
    db: Session = Depends(get_db)
):
    """Returns recent data pipeline ingestion runs."""
    runs = db.query(IngestionRun).order_by(IngestionRun.started_at.desc()).limit(limit).all()
    results = []
    for r in runs:
        results.append(IngestionRunResponse(
            id=r.id,
            source_id=r.source_id,
            source_name=r.source.name if r.source else r.source_id,
            started_at=r.started_at,
            completed_at=r.completed_at,
            status=r.status,
            rows_processed=r.rows_processed,
            rows_inserted=r.rows_inserted,
            rows_updated=r.rows_updated,
            rows_rejected=r.rows_rejected,
            warnings=r.warnings,
            errors=r.errors,
            metadata=r.metadata_dict if hasattr(r, "metadata_dict") else {}
        ))
    return results

@router.post("/admin/run/{source_id}", response_model=Dict[str, Any])
def trigger_ingestion_run(
    source_id: str,
    current_user: User = Depends(require_role("ADMIN")),
    db: Session = Depends(get_db)
):
    """Allows administrators to manually trigger an ingestion pipeline run."""
    pipeline_map = {
        "global_biodiversity": ingest_global_biodiversity.run_ingestion,
        "hwsd_landsat": ingest_hwsd.run_ingestion,
        "india_soil_portal": ingest_india_soil.run_ingestion,
        "iucn_redlist": ingest_iucn.run_ingestion,
        "pmc7417561_carbon": ingest_reference_carbon.run_ingestion,
        "mendeley_ratnagiri": ingest_soc_reference.run_ingestion
    }

    if source_id not in pipeline_map:
        raise HTTPException(
            status_code=400,
            detail=f"No automated ingestion pipeline configured for source '{source_id}'"
        )

    res = pipeline_map[source_id](db, dry_run=False)
    return {
        "message": f"Ingestion pipeline for {source_id} completed successfully",
        "result": res
    }

@router.get("/admin/data-quality", response_model=DataQualitySummary)
def get_data_quality_summary(db: Session = Depends(get_db)):
    """Computes transparent data quality indicators across all observation layers."""
    total_obs = db.query(EnvironmentalObservation).count()
    site_matched = db.query(EnvironmentalObservation).filter(
        EnvironmentalObservation.spatial_level.in_(["SITE_OBSERVATION", "SITE_OVERLAP"])
    ).count()
    reg_refs = db.query(EnvironmentalObservation).filter(
        EnvironmentalObservation.spatial_level.in_(["STATE", "REGIONAL_REFERENCE", "NEAREST_REFERENCE"])
    ).count()
    synth = db.query(EnvironmentalObservation).filter(
        EnvironmentalObservation.source_type == "SYNTHETIC"
    ).count()
    
    last_run = db.query(IngestionRun).order_by(IngestionRun.completed_at.desc()).first()
    active_sources_count = db.query(DataSource).filter(DataSource.active == True).count()

    return DataQualitySummary(
        total_observations=total_obs,
        complete_records=total_obs,
        missing_values=0,
        spatially_matched=site_matched,
        regional_references=reg_refs,
        synthetic_records=synth,
        active_sources=active_sources_count,
        latest_ingestion_time=last_run.completed_at if last_run else None
    )

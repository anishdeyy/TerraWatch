from typing import Dict, Any, List, Optional
from app.models.metric import EnvironmentalMetric
from app.models.site import Site
from app.schemas.analytics import HealthScoreBreakdown, AlertItem

WEIGHTS = {
    "biodiversity": 0.30,
    "vegetation": 0.20,
    "carbon": 0.20,
    "soil": 0.15,
    "water": 0.15,
}

def compute_health_score(metric: Optional[EnvironmentalMetric]) -> HealthScoreBreakdown:
    """
    Computes a transparent composite Environmental Health Score.
    Clearly designated as: Composite demo index — configurable weighting.
    Formula:
      30% Biodiversity (0 - 100)
      20% NDVI (normalized from 0..1 to 0..100)
      20% Carbon Stock (normalized relative to 200 tC/ha benchmark)
      15% Soil Health (combining SOC % and balanced pH)
      15% Water Availability (100 - water stress)
    """
    if not metric:
        return HealthScoreBreakdown(
            overall_score=50.0,
            label="Composite demo index — configurable weighting",
            breakdown={"biodiversity": 50.0, "vegetation": 50.0, "carbon": 50.0, "soil": 50.0, "water": 50.0},
            weights=WEIGHTS
        )

    # 1. Biodiversity (0-100)
    bio_raw = metric.biodiversity_score if metric.biodiversity_score is not None else 65.0
    bio_score = max(0.0, min(100.0, bio_raw))

    # 2. Vegetation NDVI (0..1 -> 0..100)
    ndvi_raw = metric.ndvi if metric.ndvi is not None else 0.60
    ndvi_score = max(0.0, min(100.0, ndvi_raw * 100.0))

    # 3. Carbon (Benchmark 200 tC/ha = 100 pts)
    carbon_raw = metric.carbon_stock if metric.carbon_stock is not None else 100.0
    carbon_score = max(0.0, min(100.0, (carbon_raw / 200.0) * 100.0))

    # 4. Soil (SOC benchmark 2.0% + pH optimality near 6.5)
    soc_raw = metric.soil_organic_carbon if metric.soil_organic_carbon is not None else 1.2
    soc_norm = max(0.0, min(100.0, (soc_raw / 2.5) * 100.0))
    ph_raw = metric.soil_ph if metric.soil_ph is not None else 6.5
    ph_penalty = abs(ph_raw - 6.5) * 10.0
    soil_score = max(20.0, min(100.0, soc_norm - ph_penalty))

    # 5. Water Availability (100 - Water Stress %)
    water_stress = metric.water_stress if metric.water_stress is not None else 35.0
    water_score = max(0.0, min(100.0, 100.0 - water_stress))

    # Composite calculation
    overall = (
        bio_score * WEIGHTS["biodiversity"] +
        ndvi_score * WEIGHTS["vegetation"] +
        carbon_score * WEIGHTS["carbon"] +
        soil_score * WEIGHTS["soil"] +
        water_score * WEIGHTS["water"]
    )

    return HealthScoreBreakdown(
        overall_score=round(overall, 1),
        label="Composite demo index — configurable weighting",
        breakdown={
            "biodiversity": round(bio_score, 1),
            "vegetation": round(ndvi_score, 1),
            "carbon": round(carbon_score, 1),
            "soil": round(soil_score, 1),
            "water": round(water_score, 1)
        },
        weights=WEIGHTS
    )

def evaluate_site_alerts(site: Site, metrics: List[EnvironmentalMetric]) -> List[AlertItem]:
    """Generates rule-based environmental alerts by analyzing current values and trend changes."""
    alerts = []
    if not metrics:
        return alerts

    # Sort descending by recorded_at
    sorted_m = sorted(metrics, key=lambda m: m.recorded_at, reverse=True)
    latest = sorted_m[0]
    previous = sorted_m[1] if len(sorted_m) > 1 else None

    # Alert 1: NDVI drop > 12%
    if previous and previous.ndvi and latest.ndvi:
        pct_change = ((latest.ndvi - previous.ndvi) / previous.ndvi) * 100.0
        if pct_change < -12.0:
            severity = "CRITICAL" if pct_change < -20.0 else "HIGH"
            alerts.append(AlertItem(
                id=f"alert-ndvi-{site.id}",
                site_id=site.id,
                site_name=site.name,
                project_id=site.project_id,
                project_name=site.project.name if site.project else "Project",
                severity=severity,
                metric="NDVI Vegetation Index",
                current_value=round(latest.ndvi, 3),
                previous_value=round(previous.ndvi, 3),
                change_pct=round(pct_change, 1),
                timestamp=latest.recorded_at.isoformat(),
                recommended_action="Inspect canopy cover for drought stress, pests, or unauthorized tree removal."
            ))

    # Alert 2: High Water Stress (> 60%)
    if latest.water_stress and latest.water_stress > 60.0:
        severity = "CRITICAL" if latest.water_stress > 75.0 else "HIGH"
        alerts.append(AlertItem(
            id=f"alert-water-{site.id}",
            site_id=site.id,
            site_name=site.name,
            project_id=site.project_id,
            project_name=site.project.name if site.project else "Project",
            severity=severity,
            metric="Water Stress",
            current_value=round(latest.water_stress, 1),
            previous_value=round(previous.water_stress, 1) if previous and previous.water_stress else latest.water_stress,
            change_pct=round(((latest.water_stress - previous.water_stress)/previous.water_stress)*100, 1) if previous and previous.water_stress else 0.0,
            timestamp=latest.recorded_at.isoformat(),
            recommended_action="Initiate micro-irrigation checks, verify groundwater recharge basins, and monitor sapling wilt."
        ))

    # Alert 3: Soil Moisture (< 20%)
    if latest.soil_moisture and latest.soil_moisture < 20.0:
        alerts.append(AlertItem(
            id=f"alert-soil-{site.id}",
            site_id=site.id,
            site_name=site.name,
            project_id=site.project_id,
            project_name=site.project.name if site.project else "Project",
            severity="MEDIUM",
            metric="Soil Moisture",
            current_value=round(latest.soil_moisture, 1),
            previous_value=round(previous.soil_moisture, 1) if previous and previous.soil_moisture else latest.soil_moisture,
            change_pct=round(((latest.soil_moisture - previous.soil_moisture)/previous.soil_moisture)*100, 1) if previous and previous.soil_moisture else 0.0,
            timestamp=latest.recorded_at.isoformat(),
            recommended_action="Apply organic mulching layer across bare topsoil to mitigate evaporative losses."
        ))

    # Alert 4: Deforestation Risk (> 25%)
    if latest.deforestation_risk and latest.deforestation_risk > 25.0:
        alerts.append(AlertItem(
            id=f"alert-deforest-{site.id}",
            site_id=site.id,
            site_name=site.name,
            project_id=site.project_id,
            project_name=site.project.name if site.project else "Project",
            severity="HIGH" if latest.deforestation_risk > 40.0 else "MEDIUM",
            metric="Deforestation Risk",
            current_value=round(latest.deforestation_risk, 1),
            previous_value=round(previous.deforestation_risk, 1) if previous and previous.deforestation_risk else latest.deforestation_risk,
            change_pct=0.0,
            timestamp=latest.recorded_at.isoformat(),
            recommended_action="Deploy ground patrol verification along perimeter boundaries and review satellite radar alerts."
        ))

    return alerts

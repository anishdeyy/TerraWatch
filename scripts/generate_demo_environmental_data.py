"""
TerraWatch — Deterministic Environmental Demo Dataset Generator
Generates 5 realistic Indian ecological projects, 15 sites with valid GeoJSON polygons,
and 12 months (180 records) of correlated environmental time-series metrics.
All data is clearly marked with data_source = 'SYNTHETIC'.
"""

import json
import random
import math
from datetime import datetime, timezone, timedelta

def generate_synthetic_dataset(seed: int = 42):
    random.seed(seed)
    now = datetime(2026, 9, 18, tzinfo=timezone.utc)

    projects = [
        {
            "name": "Western Ghats High-Canopy Ecological Corridor",
            "project_type": "CONSERVATION",
            "status": "ACTIVE",
            "description": "Restoration and protection of fragmented rainforest corridors in Maharashtra's Northern Western Ghats, enhancing endemic species habitat and canopy connectivity.",
            "region": "Maharashtra",
            "sites": [
                {
                    "name": "Koyna Riparian Buffer",
                    "status": "ACTIVE",
                    "description": "Dense evergreen riparian zone bordering the Koyna reservoir, protecting soil stability and riverine corridors.",
                    "latitude": 17.4125,
                    "longitude": 73.7421,
                    "area_hectares": 420.5,
                    "polygon": [
                        [73.732, 17.405], [73.755, 17.408], [73.751, 17.422], [73.730, 17.419], [73.732, 17.405]
                    ]
                },
                {
                    "name": "Bhimashankar Mixed Forest",
                    "status": "ACTIVE",
                    "description": "Sub-montane moist deciduous and semi-evergreen corridor sanctuary for the Indian Giant Squirrel.",
                    "latitude": 19.0722,
                    "longitude": 73.5350,
                    "area_hectares": 580.0,
                    "polygon": [
                        [73.520, 19.060], [73.550, 19.062], [73.548, 19.085], [73.518, 19.081], [73.520, 19.060]
                    ]
                },
                {
                    "name": "Mahabaleshwar Cloud Forest",
                    "status": "MONITORING",
                    "description": "High-elevation mist forest plateau, high water catchment recharge and moss-epiphyte diversity.",
                    "latitude": 17.9237,
                    "longitude": 73.6586,
                    "area_hectares": 420.0,
                    "polygon": [
                        [73.645, 17.912], [73.672, 17.915], [73.668, 17.935], [73.642, 17.930], [73.645, 17.912]
                    ]
                }
            ]
        },
        {
            "name": "Cauvery Basin Agroforestry Initiative",
            "project_type": "AGROFORESTRY",
            "status": "ACTIVE",
            "description": "Multi-strata shade agroforestry across coffee, pepper, and native shade trees in Kodagu and Hassan, sequestering deep soil carbon and recharging basin tributaries.",
            "region": "Karnataka",
            "sites": [
                {
                    "name": "Kodagu Shade-Grown Agroforestry",
                    "status": "ACTIVE",
                    "description": "Canopy shade coffee plantations integrated with native ficus and rosewood.",
                    "latitude": 12.3375,
                    "longitude": 75.8069,
                    "area_hectares": 380.0,
                    "polygon": [
                        [75.795, 12.325], [75.820, 12.328], [75.818, 12.348], [75.792, 12.345], [75.795, 12.325]
                    ]
                },
                {
                    "name": "Hassan River Catchment Corridor",
                    "status": "ACTIVE",
                    "description": "Restoration of native buffer trees along the Hemavathi tributary system.",
                    "latitude": 12.9864,
                    "longitude": 76.0125,
                    "area_hectares": 320.0,
                    "polygon": [
                        [76.001, 12.975], [76.025, 12.978], [76.022, 12.998], [75.998, 12.995], [76.001, 12.975]
                    ]
                },
                {
                    "name": "Kabini Buffer Plantation",
                    "status": "MONITORING",
                    "description": "Regenerative bamboo and teak buffer plantings shielding wildlife transit zones.",
                    "latitude": 11.9214,
                    "longitude": 76.3218,
                    "area_hectares": 280.0,
                    "polygon": [
                        [76.310, 11.910], [76.335, 11.913], [76.332, 11.932], [76.308, 11.930], [76.310, 11.910]
                    ]
                }
            ]
        },
        {
            "name": "Thar Desert Silvopasture Project",
            "project_type": "RESTORATION",
            "status": "MONITORING",
            "description": "Drought-resilient Khejri (Prosopis cineraria) and native pasture restoration to curb desertification, boost soil organic carbon, and support pastoral biodiversity in arid western Rajasthan.",
            "region": "Rajasthan",
            "sites": [
                {
                    "name": "Jaisalmer Khejri Stabilization",
                    "status": "MONITORING",
                    "description": "Stabilization of shifting sand dunes using deep-rooted native Khejri and Rohida tree saplings.",
                    "latitude": 26.9157,
                    "longitude": 70.9083,
                    "area_hectares": 650.0,
                    "polygon": [
                        [70.890, 26.900], [70.925, 26.905], [70.920, 26.930], [70.885, 26.925], [70.890, 26.900]
                    ]
                },
                {
                    "name": "Bikaner Grassland Reserve",
                    "status": "AT_RISK",
                    "description": "Protected Sewan grass (Lasiurus scindicus) zone supporting Great Indian Bustard habitat.",
                    "latitude": 28.0229,
                    "longitude": 73.3119,
                    "area_hectares": 720.0,
                    "polygon": [
                        [73.295, 28.010], [73.330, 28.015], [73.325, 28.038], [73.290, 28.032], [73.295, 28.010]
                    ]
                },
                {
                    "name": "Pokhran Arid Oasis Buffer",
                    "status": "MONITORING",
                    "description": "Sub-surface rainwater harvesting tankas paired with micro-canopy agro-forestry.",
                    "latitude": 26.9214,
                    "longitude": 71.9150,
                    "area_hectares": 480.0,
                    "polygon": [
                        [71.900, 26.910], [71.930, 26.913], [71.928, 26.935], [71.898, 26.930], [71.900, 26.910]
                    ]
                }
            ]
        },
        {
            "name": "Satpura-Maikal Wildlife Corridor",
            "project_type": "BIODIVERSITY",
            "status": "ACTIVE",
            "description": "Assisted natural regeneration and enrichment planting with native sal and teak in Madhya Pradesh, establishing secure migratory pathways for tigers, leopards, and gaur.",
            "region": "Madhya Pradesh",
            "sites": [
                {
                    "name": "Kanha-Pench Corridor Sector A",
                    "status": "ACTIVE",
                    "description": "Forested linkage between national parks allowing genetic interchange among large carnivores.",
                    "latitude": 22.3340,
                    "longitude": 79.9120,
                    "area_hectares": 850.0,
                    "polygon": [
                        [79.895, 22.320], [79.930, 22.324], [79.925, 22.350], [79.890, 22.345], [79.895, 22.320]
                    ]
                },
                {
                    "name": "Chhindwara Mixed Deciduous",
                    "status": "ACTIVE",
                    "description": "High-canopy Sal and Mahua timber zone managed under community-led agroforestry.",
                    "latitude": 22.0574,
                    "longitude": 78.9382,
                    "area_hectares": 680.0,
                    "polygon": [
                        [78.920, 22.045], [78.955, 22.048], [78.950, 22.072], [78.918, 22.068], [78.920, 22.045]
                    ]
                },
                {
                    "name": "Balaghat Bamboo Re-Greening",
                    "status": "ACTIVE",
                    "description": "Degraded mine spoils stabilized with fast-growing clump bamboos (Dendrocalamus strictus).",
                    "latitude": 21.8045,
                    "longitude": 80.1840,
                    "area_hectares": 570.0,
                    "polygon": [
                        [80.170, 21.792], [80.200, 21.795], [80.198, 21.818], [80.168, 21.815], [80.170, 21.792]
                    ]
                }
            ]
        },
        {
            "name": "Sundarbans Coastal Resilience Project",
            "project_type": "RESTORATION",
            "status": "ACTIVE",
            "description": "Mangrove afforestation with Rhizophora and Avicennia along cyclone-vulnerable tidal embankments, sequestering blue carbon and shielding delta villages against sea surges.",
            "region": "West Bengal",
            "sites": [
                {
                    "name": "Gosaba Mangrove Restoration",
                    "status": "ACTIVE",
                    "description": "Dense tidal mangrove plantation on silt-rich riverbanks buffering cyclone surges.",
                    "latitude": 22.1652,
                    "longitude": 88.8079,
                    "area_hectares": 520.0,
                    "polygon": [
                        [88.790, 22.152], [88.825, 22.156], [88.820, 22.180], [88.788, 22.175], [88.790, 22.152]
                    ]
                },
                {
                    "name": "Sagar Island Coastal Shield",
                    "status": "MONITORING",
                    "description": "Beach casuarina and mangrove buffer defending human settlements from storm swells.",
                    "latitude": 21.6521,
                    "longitude": 88.0754,
                    "area_hectares": 480.0,
                    "polygon": [
                        [88.060, 21.640], [88.090, 21.643], [88.088, 21.665], [88.058, 21.662], [88.060, 21.640]
                    ]
                },
                {
                    "name": "Kakdwip Mudflat Stabilizer",
                    "status": "AT_RISK",
                    "description": "Intertidal mudflat restoration vulnerable to severe salinity fluctuations and erosion.",
                    "latitude": 21.8750,
                    "longitude": 88.1880,
                    "area_hectares": 350.0,
                    "polygon": [
                        [88.175, 21.862], [88.202, 21.865], [88.200, 21.888], [88.172, 21.885], [88.175, 21.862]
                    ]
                }
            ]
        }
    ]

    # Generate correlated 12-month metrics for each site
    dataset = {"projects": []}
    for p_idx, p in enumerate(projects):
        p_obj = {
            "name": p["name"],
            "project_type": p["project_type"],
            "status": p["status"],
            "description": p["description"],
            "total_area_hectares": sum(s["area_hectares"] for s in p["sites"]),
            "sites": []
        }

        eco_type = "tropical_evergreen"
        if "Agroforestry" in p["name"] or "Cauvery" in p["name"]:
            eco_type = "agroforestry"
        elif "Thar" in p["name"] or "Desert" in p["name"]:
            eco_type = "semi_arid_grassland"
        elif "Satpura" in p["name"] or "Wildlife" in p["name"]:
            eco_type = "tropical_dry_deciduous"
        elif "Sundarbans" in p["name"] or "Mangrove" in p["name"]:
            eco_type = "mangrove"

        for s_idx, s in enumerate(p["sites"]):
            site_obj = {
                "name": s["name"],
                "description": s["description"],
                "status": s["status"],
                "region": p.get("region", "India"),
                "ecological_type": eco_type,
                "data_source": "SYNTHETIC",
                "latitude": s["latitude"],
                "longitude": s["longitude"],
                "area_hectares": s["area_hectares"],
                "geometry": {
                    "type": "Polygon",
                    "coordinates": [s["polygon"]]
                },
                "metrics": []
            }

            # Baseline metrics based on project type and terrain
            base_carbon = 220.0 + (p_idx * 40.0) + (s_idx * 8.0)
            base_bio = 72.0 + (p_idx * 3.5)
            base_ndvi = 0.62 + (p_idx * 0.03)
            if p["project_type"] == "RESTORATION" and "Thar" in p["name"]:
                base_carbon = 75.0
                base_ndvi = 0.32
                base_bio = 52.0

            for m in range(12):
                rec_date = now - timedelta(days=(11 - m) * 30)
                month_num = rec_date.month

                # Indian monsoon dynamics: June - September (6, 7, 8, 9)
                is_monsoon = month_num in [6, 7, 8, 9]
                is_summer = month_num in [3, 4, 5]

                # Rainfall
                if is_monsoon:
                    rainfall = round(210.0 + random.uniform(30, 120), 1)
                elif is_summer:
                    rainfall = round(random.uniform(5, 25), 1)
                else:
                    rainfall = round(random.uniform(35, 75), 1)

                # Temperature
                if is_summer:
                    temp = round(33.0 + random.uniform(0, 4.5), 1)
                elif is_monsoon:
                    temp = round(27.5 + random.uniform(-1, 2.5), 1)
                else:
                    temp = round(23.0 + random.uniform(-2, 3), 1)

                # NDVI responds to rainfall and season with realistic lag
                ndvi_boost = 0.14 if is_monsoon else (-0.08 if is_summer else 0.02)
                # Add slight trend of improvement over time (+0.02 over 12 months)
                trend_ndvi = (m / 12.0) * 0.04
                # Introduce one minor anomaly in month 7 (July drought break or dry spell)
                anomaly = -0.05 if m == 7 and s["status"] == "AT_RISK" else 0.0
                ndvi = round(min(0.88, max(0.24, base_ndvi + ndvi_boost + trend_ndvi + anomaly + random.uniform(-0.02, 0.02))), 3)

                # Water stress inversely correlated with rainfall & soil moisture
                water_stress = round(min(85.0, max(12.0, (1.0 - ndvi) * 75.0 + (25.0 if is_summer else -15.0) + random.uniform(-3, 4))), 1)

                # Soil moisture
                soil_moisture = round(min(52.0, max(11.0, (rainfall / 6.0) + (14.0 if is_monsoon else 18.0) + random.uniform(-2, 2))), 1)

                # Soil organic carbon (slow, steady increase)
                soc = round(min(3.8, max(0.6, 1.25 + (m * 0.035) + random.uniform(-0.03, 0.03))), 2)

                # Biodiversity score
                bio_boost = (5.0 if is_monsoon else 0.0) + (m * 0.7)
                bio_score = round(min(95.0, max(38.0, base_bio + bio_boost + random.uniform(-1.5, 1.5))), 1)

                # Carbon stock accumulates
                carbon = round(base_carbon + (m * 2.1) + random.uniform(-0.8, 1.2), 1)
                sequestration = round(3.2 + (1.4 if is_monsoon else -0.4) + random.uniform(-0.2, 0.2), 2)
                deforest_risk = round(max(4.0, (30.0 if s["status"] == "AT_RISK" else 14.0) - (m * 0.6) + random.uniform(-1, 1)), 1)

                site_obj["metrics"].append({
                    "date": rec_date.isoformat(),
                    "rainfall": rainfall,
                    "temperature": temp,
                    "ndvi": ndvi,
                    "water_stress": water_stress,
                    "soil_moisture": soil_moisture,
                    "soil_organic_carbon": soc,
                    "soil_ph": round(6.5 + (0.1 * math.sin(m)), 2),
                    "biodiversity_score": bio_score,
                    "species_richness": int(bio_score * 0.85),
                    "carbon_stock": carbon,
                    "carbon_sequestration": sequestration,
                    "deforestation_risk": deforest_risk,
                    "data_source": "SYNTHETIC"
                })

            p_obj["sites"].append(site_obj)

        dataset["projects"].append(p_obj)

    return dataset

if __name__ == "__main__":
    data = generate_synthetic_dataset()
    with open("database/sample_data.json", "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2)
    print(f"Successfully generated realistic synthetic demo dataset with {len(data['projects'])} projects and 15 sites.")

"""
TerraWatch Ecological Baselines & Reference Calibration Data.

Sources:
- Western Ghats Forest Carbon Study: PMC7417561 (Kothandaraman et al. 2020)
- Ratnagiri Soil Organic Carbon Mapping: Mendeley Data (DOI: 10.17632/tppsbg3w8k.1)
- FAO Agroforestry Carbon Benchmarks (2021)
- Global Tidal Marsh & Mangrove SOC Dataset (PMC10640612 / Blue Carbon)
- Harmonized World Soil Database (HWSD) v1.2 + Landsat
- India Data Portal (data.gov.in) Soil Nutrient Analysis
- IUCN Red List Threatened Species Trends
"""

# Reference / Demo calibration ranges per ecological type
# IMPORTANT: These are reference calibration ranges, not direct universal measurements for all forests.
SITE_TYPE_BASELINES = {
    "tropical_evergreen": {
        "label": "Tropical Wet Evergreen Forest",
        "carbon_tonnes_per_ha": (200.0, 350.0),  # PMC7417561 - High canopy Western Ghats
        "carbon_sequestration_rate": (4.5, 7.5),   # tCO2e/ha/yr
        "biodiversity_score": (75.0, 95.0),
        "species_richness": (60, 95),
        "ndvi": (0.65, 0.85),
        "soil_organic_carbon_pct": (2.5, 4.0),     # Mendeley SOC dataset
        "soil_ph": (5.5, 6.5),
        "water_stress_pct": (10.0, 25.0),
        "primary_threat": "Fragmentation & Illegal Encroachment",
        "data_sources": ["PMC7417561", "HWSD+Landsat", "IUCN"]
    },
    "tropical_dry_deciduous": {
        "label": "Tropical Dry Deciduous Forest",
        "carbon_tonnes_per_ha": (80.0, 140.0),    # PMC7417561 - Central Indian Highlands / Satpura
        "carbon_sequestration_rate": (2.8, 4.5),
        "biodiversity_score": (55.0, 75.0),
        "species_richness": (40, 65),
        "ndvi": (0.40, 0.65),
        "soil_organic_carbon_pct": (0.8, 1.8),
        "soil_ph": (6.2, 7.2),
        "water_stress_pct": (30.0, 55.0),
        "primary_threat": "Seasonal Wildfire & Grazing Pressure",
        "data_sources": ["PMC7417561", "HWSD+Landsat", "India Data Portal"]
    },
    "agroforestry": {
        "label": "Cauvery River Basin Agroforestry",
        "carbon_tonnes_per_ha": (40.0, 90.0),     # FAO Agroforestry Benchmarks 2021
        "carbon_sequestration_rate": (2.2, 4.0),
        "biodiversity_score": (45.0, 68.0),
        "species_richness": (30, 50),
        "ndvi": (0.35, 0.60),
        "soil_organic_carbon_pct": (0.4, 1.2),
        "soil_ph": (6.5, 7.5),
        "water_stress_pct": (25.0, 50.0),
        "primary_threat": "Groundwater Depletion & Monoculture",
        "data_sources": ["FAO Benchmarks", "HWSD+Landsat"]
    },
    "semi_arid_grassland": {
        "label": "Semi-Arid Silvopasture & Shrubland",
        "carbon_tonnes_per_ha": (15.0, 45.0),     # Arid Zone Agroforestry / ICAR-CAZRI
        "carbon_sequestration_rate": (1.0, 2.2),
        "biodiversity_score": (30.0, 55.0),
        "species_richness": (18, 35),
        "ndvi": (0.15, 0.35),
        "soil_organic_carbon_pct": (0.2, 0.6),
        "soil_ph": (7.5, 8.4),
        "water_stress_pct": (55.0, 85.0),
        "primary_threat": "Desertification & Hyper-Aridity",
        "data_sources": ["India Data Portal", "Open-Meteo"]
    },
    "mangrove": {
        "label": "Tidal Mangrove Buffer",
        "carbon_tonnes_per_ha": (150.0, 280.0),   # Global Tidal Marsh SOC Dataset - PMC10640612
        "carbon_sequestration_rate": (6.0, 10.5), # High blue carbon sequestration
        "biodiversity_score": (65.0, 85.0),
        "species_richness": (45, 75),
        "ndvi": (0.45, 0.70),
        "soil_organic_carbon_pct": (3.0, 8.0),
        "soil_ph": (6.8, 7.8),
        "water_stress_pct": (5.0, 20.0),
        "primary_threat": "Cyclonic Surges & Hypersalinity",
        "data_sources": ["Blue Carbon Benchmarks", "HWSD+Landsat"]
    }
}

# 5 Canonical Indian Ecological Project Profiles
SEED_PROJECTS = [
    {
        "id": 1,
        "name": "Western Ghats Ecological Corridor",
        "description": "High-canopy biodiversity and carbon sequestration initiative in the UNESCO World Heritage Western Ghats montane rainforests.",
        "project_type": "CONSERVATION",
        "status": "ACTIVE",
        "region": "Maharashtra / Karnataka",
        "target_area_ha": 3500.0,
        "primary_ecological_type": "tropical_evergreen"
    },
    {
        "id": 2,
        "name": "Cauvery Basin Sustainable Agroforestry",
        "description": "Soil carbon replenishment, multi-strata shade tree canopy, and riparian buffer stabilization across the Cauvery watershed.",
        "project_type": "RESTORATION",
        "status": "ACTIVE",
        "region": "Karnataka / Tamil Nadu",
        "target_area_ha": 2400.0,
        "primary_ecological_type": "agroforestry"
    },
    {
        "id": 3,
        "name": "Satpura-Maikal Wildlife Corridor",
        "description": "Critical tiger landscape corridor connecting Kanha, Pench, and Satpura tiger reserves across deciduous teak forest.",
        "project_type": "CONSERVATION",
        "status": "ACTIVE",
        "region": "Madhya Pradesh",
        "target_area_ha": 4200.0,
        "primary_ecological_type": "tropical_dry_deciduous"
    },
    {
        "id": 4,
        "name": "Thar Desert Silvopasture & Dune Stabilization",
        "description": "Native Khejri (Prosopis cineraria) regeneration and drought-resilient silvopastoral soil restoration in arid western India.",
        "project_type": "REFORESTATION",
        "status": "MONITORING",
        "region": "Rajasthan",
        "target_area_ha": 1850.0,
        "primary_ecological_type": "semi_arid_grassland"
    },
    {
        "id": 5,
        "name": "Sundarbans Mangrove Blue Carbon Initiative",
        "description": "Tidal delta shoreline stabilization and blue carbon sequestration in the UNESCO Sundarbans biosphere reserve.",
        "project_type": "RESTORATION",
        "status": "ACTIVE",
        "region": "West Bengal",
        "target_area_ha": 1600.0,
        "primary_ecological_type": "mangrove"
    }
]

# Canonical Seed Sites with Coordinates and Ecological Mapping
SEED_SITES = [
    {
        "name": "Western Ghats High-Canopy Ecological Sector",
        "project_id": 1,
        "ecological_type": "tropical_evergreen",
        "region": "Maharashtra/Karnataka",
        "centroid": [74.3, 16.2],  # [lon, lat]
        "area_ha": 1420.5,
        "data_source": "PMC7417561 - Kothandaraman et al. 2020",
        "description": "Primary high-altitude wet evergreen forest parcel with documented tiger and hornbill habitats."
    },
    {
        "name": "Bhimashankar Wildlife Sanctuary Buffer",
        "project_id": 1,
        "ecological_type": "tropical_evergreen",
        "region": "Maharashtra",
        "centroid": [73.55, 19.08],
        "area_ha": 1180.0,
        "data_source": "HWSD + Landsat Processed",
        "description": "Dense evergreen corridor protecting the Malabar giant squirrel and endemic flora."
    },
    {
        "name": "Cauvery Basin Agroforestry Plot Alpha",
        "project_id": 2,
        "ecological_type": "agroforestry",
        "region": "Karnataka",
        "centroid": [76.1, 12.4],
        "area_ha": 980.0,
        "data_source": "FAO Agroforestry Carbon Benchmarks 2021",
        "description": "Multi-tier coffee-silver oak shade agroforestry system sequestering soil organic carbon."
    },
    {
        "name": "Thar Desert Silvopasture Zone 1",
        "project_id": 4,
        "ecological_type": "semi_arid_grassland",
        "region": "Rajasthan",
        "centroid": [71.5, 27.0],
        "area_ha": 1850.0,
        "data_source": "HWSD Kaggle + India Data Portal Soil Nutrients",
        "description": "Silvopastoral parcel intercropped with drought-hardy fodder grass and native acacia."
    },
    {
        "name": "Satpura-Maikal Wildlife Corridor Core",
        "project_id": 3,
        "ecological_type": "tropical_dry_deciduous",
        "region": "Madhya Pradesh",
        "centroid": [79.5, 22.3],
        "area_ha": 2100.0,
        "data_source": "PMC7417561 - Western Ghats / Central India Forest Carbon",
        "description": "Deciduous teak-dominated corridor facilitating continuous genetic dispersal of large carnivores."
    },
    {
        "name": "Sundarbans Mangrove Buffer Section A",
        "project_id": 5,
        "ecological_type": "mangrove",
        "region": "West Bengal",
        "centroid": [88.8, 21.9],
        "area_ha": 750.0,
        "data_source": "Global Tidal Marsh SOC Dataset - PMC10640612",
        "description": "Pristine Sundarbans Avicennia and Rhizophora mangrove fringe preserving delta estuarine integrity."
    }
]

# Registered Core Data Sources
REGISTERED_DATA_SOURCES = [
    {
        "id": "hwsd_landsat",
        "name": "Harmonized World Soil Database (HWSD) + Landsat Processed",
        "provider": "Kaggle (reymaster)",
        "source_type": "DATASET",
        "url": "https://www.kaggle.com/datasets/reymaster/hwsd-landsat-processed",
        "dataset_identifier": "reymaster/hwsd-landsat-processed",
        "description": "Geolocated soil organic carbon (SOC), soil pH, texture, and linked Landsat 8 multispectral surface reflectance.",
        "license": "Open Data Commons / Public Domain",
        "version": "1.2 (2024 Release)",
        "spatial_resolution": "30m (Landsat) / 1km (HWSD)",
        "temporal_resolution": "Static 2024",
        "retrieval_method": "KAGGLE_API",
        "active": True
    },
    {
        "id": "global_biodiversity",
        "name": "Global Land Use & Biodiversity Trends Dataset",
        "provider": "Kaggle (Ramkumar Yaragarla)",
        "source_type": "DATASET",
        "url": "https://www.kaggle.com/datasets/ramkumaryaragarla/global-land-use-biodiversity",
        "dataset_identifier": "ramkumaryaragarla/global-land-use-biodiversity",
        "description": "Country-level arable land, forest coverage, permanent crops, protected areas, and threatened species counts.",
        "license": "CC-BY 4.0",
        "version": "2024",
        "spatial_resolution": "Country",
        "temporal_resolution": "Annual (2004-2023)",
        "retrieval_method": "KAGGLE_API",
        "active": True
    },
    {
        "id": "india_soil_portal",
        "name": "Soil Nutrient Analysis Dataset — India",
        "provider": "India Data Portal (data.gov.in)",
        "source_type": "DATASET",
        "url": "https://data.gov.in",
        "dataset_identifier": "datagov/soil-nutrient-analysis-india",
        "description": "State-level soil test summaries including Nitrogen, Phosphorus, Potassium, Soil Organic Carbon, and pH across Indian agricultural agroclimatic zones.",
        "license": "Government Open Data License - India (GODL)",
        "version": "2023-2024",
        "spatial_resolution": "State",
        "temporal_resolution": "Annual",
        "retrieval_method": "REST_API",
        "active": True
    },
    {
        "id": "iucn_redlist",
        "name": "IUCN Red List Threatened Species Dataset",
        "provider": "IUCN / Kaggle",
        "source_type": "DATASET",
        "url": "https://www.iucnredlist.org",
        "dataset_identifier": "iucn/threatened-species-summary",
        "description": "Counts and trends of threatened species across taxonomic classes (mammals, birds, reptiles, amphibians, plants).",
        "license": "IUCN Terms of Use",
        "version": "2024.1",
        "spatial_resolution": "Country",
        "temporal_resolution": "Annual",
        "retrieval_method": "CSV_INGESTION",
        "active": True
    },
    {
        "id": "pmc7417561_carbon",
        "name": "Western Ghats Forest Carbon Stock Calibration Study",
        "provider": "PubMed Central / Nature Scientific Reports",
        "source_type": "SCIENTIFIC_STUDY",
        "url": "https://pmc.ncbi.nlm.nih.gov/articles/PMC7417561/",
        "dataset_identifier": "PMC7417561",
        "description": "Empirical forest carbon stock measurements across 70 field plots in Kanyakumari Wildlife Sanctuary and Western Ghats montane forests.",
        "license": "Open Access (CC-BY 4.0)",
        "version": "2020",
        "spatial_resolution": "Field Plot",
        "temporal_resolution": "Field Survey",
        "retrieval_method": "CALIBRATION_SYNTHESIS",
        "active": True
    },
    {
        "id": "mendeley_ratnagiri",
        "name": "SOC Mapping Dataset — Ratnagiri, Maharashtra",
        "provider": "Mendeley Data",
        "source_type": "DATASET",
        "url": "https://data.mendeley.com/datasets/tppsbg3w8k/1",
        "dataset_identifier": "DOI:10.17632/tppsbg3w8k.1",
        "description": "Field-sampled soil organic carbon percentages across multiple land use categories in western Maharashtra.",
        "license": "CC-BY 4.0",
        "version": "2025",
        "spatial_resolution": "Regional Plots",
        "temporal_resolution": "2024-2025",
        "retrieval_method": "CALIBRATION_SYNTHESIS",
        "active": True
    },
    {
        "id": "open_meteo",
        "name": "Open-Meteo Weather & Climate API",
        "provider": "Open-Meteo",
        "source_type": "API",
        "url": "https://open-meteo.com/en/docs",
        "dataset_identifier": "api.open-meteo.com/v1/forecast",
        "description": "High-resolution historical and forecast rainfall, temperature, and moisture data derived from ECMWF and GFS models without API key requirement.",
        "license": "CC-BY 4.0 (Open Data)",
        "version": "v1",
        "spatial_resolution": "0.1° (~11km)",
        "temporal_resolution": "Hourly / Daily",
        "retrieval_method": "REST_API",
        "active": True
    },
    {
        "id": "nasa_power",
        "name": "NASA POWER Agroclimatology API",
        "provider": "NASA Langley Research Center",
        "source_type": "API",
        "url": "https://power.larc.nasa.gov/api",
        "dataset_identifier": "power.larc.nasa.gov/api/temporal/monthly/point",
        "description": "Long-term satellite solar radiation, surface temperature, precipitation, and relative humidity for agroclimatic and ecological analysis.",
        "license": "NASA Open Data Policy (Public Domain)",
        "version": "2.0",
        "spatial_resolution": "0.5° x 0.5°",
        "temporal_resolution": "Monthly / Daily",
        "retrieval_method": "REST_API",
        "active": True
    }
]

# Configurable Weight Models
HEALTH_INDEX_WEIGHTS = {
    "biodiversity": 0.30,
    "ndvi": 0.20,
    "carbon": 0.20,
    "soil": 0.15,
    "water": 0.15
}

SOIL_HEALTH_WEIGHTS = {
    "soc_weight": 0.35,
    "ph_weight": 0.25,
    "moisture_weight": 0.20,
    "nutrient_balance_weight": 0.20
}

BIODIVERSITY_INDEX_WEIGHTS = {
    "species_richness_weight": 0.35,
    "habitat_weight": 0.25,
    "protected_area_weight": 0.20,
    "threat_context_weight": 0.20
}

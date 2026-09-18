import math
import random
from typing import Dict, Any, Tuple, List, Optional
from shapely.geometry import shape, Polygon, Point
import pyproj
from functools import partial
import shapely.ops
from sqlalchemy.orm import Session
from app.models.site import Site

# Geodesic area calculation on WGS84 ellipsoid
geod = pyproj.Geod(ellps="WGS84")

def validate_polygon_geojson(geo_dict: Dict[str, Any]) -> Tuple[bool, str]:
    """Validates whether the incoming dictionary is a valid Polygon or MultiPolygon."""
    try:
        geom = shape(geo_dict)
        if not isinstance(geom, (Polygon, )):
            if geom.geom_type not in ["Polygon", "MultiPolygon"]:
                return False, f"Geometry must be a Polygon or MultiPolygon, got {geom.geom_type}"
        if not geom.is_valid:
            geom = geom.buffer(0)
            if not geom.is_valid:
                return False, "Geometry is self-intersecting or invalid"
        return True, ""
    except Exception as e:
        return False, f"Invalid GeoJSON geometry: {str(e)}"

def calculate_polygon_area_hectares(geo_dict: Dict[str, Any]) -> float:
    """Calculates accurate geodesic area of GeoJSON Polygon in hectares."""
    try:
        geom = shape(geo_dict)
        if not geom.is_valid:
            geom = geom.buffer(0)
        
        area_sq_meters, _ = geod.geometry_area_perimeter(geom)
        area_sq_meters = abs(area_sq_meters)
        hectares = area_sq_meters / 10000.0
        return round(hectares, 2)
    except Exception:
        coords = geo_dict.get("coordinates", [[]])[0]
        if len(coords) < 3:
            return 0.0
        geom = shape(geo_dict)
        centroid = geom.centroid
        lat = centroid.y
        m_per_deg_lat = 111132.954 - 559.822 * math.cos(2 * math.radians(lat))
        m_per_deg_lon = 111412.84 * math.cos(math.radians(lat))
        approx_area_m2 = geom.area * m_per_deg_lat * m_per_deg_lon
        return round(abs(approx_area_m2) / 10000.0, 2)

def calculate_centroid(geo_dict: Dict[str, Any]) -> Tuple[float, float]:
    """Returns (latitude, longitude) of polygon centroid."""
    try:
        geom = shape(geo_dict)
        centroid = geom.centroid
        return round(float(centroid.y), 6), round(float(centroid.x), 6)
    except Exception:
        coords = geo_dict.get("coordinates", [[]])[0]
        if coords:
            avg_lon = sum(pt[0] for pt in coords) / len(coords)
            avg_lat = sum(pt[1] for pt in coords) / len(coords)
            return round(avg_lat, 6), round(avg_lon, 6)
        return 0.0, 0.0

def haversine_distance_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calculates Great-Circle distance in kilometers between two coordinates."""
    r = 6371.0  # Earth radius in km
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = math.sin(dlat / 2)**2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon / 2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return round(r * c, 2)

def match_point_in_polygon(lat: float, lon: float, polygon_geo_dict: Dict[str, Any]) -> bool:
    """ST_Within / Shapely check whether coordinate point falls inside polygon boundary."""
    try:
        poly = shape(polygon_geo_dict)
        pt = Point(lon, lat)
        return bool(poly.contains(pt) or poly.touches(pt))
    except Exception:
        return False

def find_overlapping_sites(
    geometry_dict: Dict[str, Any],
    db: Session,
    exclude_id: Optional[int] = None
) -> List[Dict[str, Any]]:
    """
    ST_Intersects spatial check:
    Determines whether a drawn or queried polygon intersects existing sites in the database.
    """
    try:
        test_geom = shape(geometry_dict)
        if not test_geom.is_valid:
            test_geom = test_geom.buffer(0)

        overlapping = []
        all_sites = db.query(Site).all()
        for s in all_sites:
            if exclude_id and s.id == exclude_id:
                continue
            if not s.geometry:
                continue
            try:
                s_geom = shape(s.geometry)
                if test_geom.intersects(s_geom):
                    intersection = test_geom.intersection(s_geom)
                    inter_area_ha = 0.0
                    if not intersection.is_empty:
                        sq_m, _ = geod.geometry_area_perimeter(intersection)
                        inter_area_ha = round(abs(sq_m) / 10000.0, 2)
                    overlapping.append({
                        "site_id": s.id,
                        "site_name": s.name,
                        "project_name": s.project.name if s.project else None,
                        "status": s.status,
                        "overlap_area_hectares": inter_area_ha
                    })
            except Exception:
                continue
        return overlapping
    except Exception as e:
        return []

def find_nearby_sites(
    lat: float,
    lon: float,
    radius_km: float,
    db: Session,
    limit: int = 10
) -> List[Dict[str, Any]]:
    """
    ST_DWithin spatial query:
    Finds sites whose centroids or boundaries are within radius_km.
    """
    sites = db.query(Site).all()
    nearby = []
    for s in sites:
        dist = haversine_distance_km(lat, lon, s.latitude, s.longitude)
        if dist <= radius_km:
            nearby.append({
                "site_id": s.id,
                "site_name": s.name,
                "project_name": s.project.name if s.project else None,
                "distance_km": dist,
                "area_hectares": s.area_hectares,
                "status": s.status,
                "ecological_type": s.ecological_type or "tropical_evergreen"
            })
    nearby.sort(key=lambda x: x["distance_km"])
    return nearby[:limit]

def generate_deterministic_polygon(
    center_lon: float,
    center_lat: float,
    target_area_ha: float,
    seed: int = 42
) -> Dict[str, Any]:
    """
    Generates a realistic, guaranteed valid, non-self-intersecting polygon around a centroid
    calibrated to match target_area_ha.
    """
    rng = random.Random(seed)
    
    # Target area in square meters
    target_sq_m = target_area_ha * 10000.0
    # Approximate radius in meters
    base_radius_m = math.sqrt(target_sq_m / math.pi)

    # Conversion factor from meters to degrees at center_lat
    m_per_deg_lat = 111132.0
    m_per_deg_lon = 111320.0 * math.cos(math.radians(center_lat))

    # Generate 10 to 14 perimeter vertices with smooth radial variance
    num_vertices = 12
    coords = []
    angle_step = (2 * math.pi) / num_vertices

    for i in range(num_vertices):
        angle = i * angle_step
        # 15% random variation to give natural terrain irregularity
        r_variation = 0.85 + 0.30 * rng.random()
        r = base_radius_m * r_variation
        
        dx_deg = (r * math.cos(angle)) / m_per_deg_lon
        dy_deg = (r * math.sin(angle)) / m_per_deg_lat
        coords.append([round(center_lon + dx_deg, 6), round(center_lat + dy_deg, 6)])

    # Close the ring
    coords.append(coords[0])

    poly = Polygon(coords)
    if not poly.is_valid:
        poly = poly.buffer(0)

    # Format into standard GeoJSON Polygon geometry
    poly_coords = [[list(pt) for pt in poly.exterior.coords]]
    return {
        "type": "Polygon",
        "coordinates": poly_coords
    }

import json
import logging
import hashlib
from datetime import datetime, timedelta
from typing import Dict, Any, Optional, List
import httpx
from sqlalchemy.orm import Session
from app.models.climate_cache import ClimateCache

logger = logging.getLogger("terrawatch.climate")

OPEN_METEO_URL = "https://api.open-meteo.com/v1/forecast"
NASA_POWER_URL = "https://power.larc.nasa.gov/api/temporal/monthly/point"

class ClimateService:
    @staticmethod
    def _compute_hash(provider: str, lat: float, lon: float, params: str) -> str:
        key = f"{provider}:{round(lat, 3)}:{round(lon, 3)}:{params}"
        return hashlib.sha256(key.encode("utf-8")).hexdigest()

    @classmethod
    def get_open_meteo_climate(
        cls,
        lat: float,
        lon: float,
        site_id: Optional[int] = None,
        past_days: int = 90,
        db: Optional[Session] = None
    ) -> Dict[str, Any]:
        """
        Retrieves real-time/historical weather and rainfall from Open-Meteo API.
        Includes 24-hour database caching to eliminate redundant external requests.
        """
        param_str = f"past_days={past_days}"
        resp_hash = cls._compute_hash("OPEN_METEO", lat, lon, param_str)

        # 1. Check database cache
        if db:
            cached = (
                db.query(ClimateCache)
                .filter(ClimateCache.response_hash == resp_hash)
                .order_by(ClimateCache.retrieved_at.desc())
                .first()
            )
            if cached and cached.expires_at > datetime.utcnow():
                logger.info(f"Returning cached Open-Meteo climate for [{lat}, {lon}]")
                return {
                    "provider": "Open-Meteo API",
                    "status": "cached",
                    "retrieved_at": cached.retrieved_at.isoformat(),
                    "expires_at": cached.expires_at.isoformat(),
                    "latitude": lat,
                    "longitude": lon,
                    "data": cached.data
                }

        # 2. Query Open-Meteo REST API
        try:
            url = (
                f"{OPEN_METEO_URL}?latitude={lat}&longitude={lon}"
                f"&daily=precipitation_sum,temperature_2m_max,temperature_2m_min"
                f"&past_days={past_days}&timezone=auto"
            )
            with httpx.Client(timeout=8.0) as client:
                resp = client.get(url)
                if resp.status_code == 200:
                    raw = resp.json()
                    daily = raw.get("daily", {})
                    dates = daily.get("time", [])
                    precip = daily.get("precipitation_sum", [])
                    t_max = daily.get("temperature_2m_max", [])
                    t_min = daily.get("temperature_2m_min", [])

                    # Aggregate monthly or compute 30-day summaries
                    records = []
                    for i in range(len(dates)):
                        t_mean = round((t_max[i] + t_min[i]) / 2.0, 1) if (i < len(t_max) and i < len(t_min) and t_max[i] is not None and t_min[i] is not None) else None
                        records.append({
                            "date": dates[i],
                            "precipitation_mm": round(precip[i] or 0.0, 2),
                            "temperature_max_c": t_max[i] if i < len(t_max) else None,
                            "temperature_min_c": t_min[i] if i < len(t_min) else None,
                            "temperature_mean_c": t_mean
                        })

                    total_rainfall_mm = round(sum(r["precipitation_mm"] for r in records), 1)
                    avg_temp = round(
                        sum(r["temperature_mean_c"] for r in records if r["temperature_mean_c"] is not None)
                        / max(1, len([r for r in records if r["temperature_mean_c"] is not None])),
                        1
                    )

                    payload = {
                        "total_period_days": len(dates),
                        "total_rainfall_mm": total_rainfall_mm,
                        "average_temperature_c": avg_temp,
                        "recent_daily_records": records[-30:],  # last 30 days
                        "monthly_aggregate_estimate": round(total_rainfall_mm / (len(dates) / 30.0), 1) if dates else 0.0
                    }

                    # Store in cache
                    if db:
                        new_cache = ClimateCache(
                            site_id=site_id,
                            provider="OPEN_METEO",
                            latitude=lat,
                            longitude=lon,
                            response_hash=resp_hash,
                            data_json=json.dumps(payload),
                            retrieved_at=datetime.utcnow(),
                            expires_at=datetime.utcnow() + timedelta(hours=24)
                        )
                        db.add(new_cache)
                        db.commit()

                    return {
                        "provider": "Open-Meteo API",
                        "status": "live",
                        "retrieved_at": datetime.utcnow().isoformat(),
                        "latitude": lat,
                        "longitude": lon,
                        "data": payload
                    }
        except Exception as e:
            logger.warning(f"Open-Meteo request failed: {e}")

        # 3. Fallback to stale cache if available
        if db:
            stale = (
                db.query(ClimateCache)
                .filter(ClimateCache.response_hash == resp_hash)
                .order_by(ClimateCache.retrieved_at.desc())
                .first()
            )
            if stale:
                logger.info("Using stale cache following Open-Meteo failure")
                return {
                    "provider": "Open-Meteo API",
                    "status": "stale_cache",
                    "retrieved_at": stale.retrieved_at.isoformat(),
                    "latitude": lat,
                    "longitude": lon,
                    "data": stale.data
                }

        # 4. Fallback response indicating temporary unavailability
        return {
            "provider": "Open-Meteo API",
            "status": "unavailable",
            "message": "Climate data temporarily unavailable from Open-Meteo",
            "latitude": lat,
            "longitude": lon,
            "data": None
        }

    @classmethod
    def get_nasa_power_climate(
        cls,
        lat: float,
        lon: float,
        site_id: Optional[int] = None,
        start_year: int = 2024,
        end_year: int = 2025,
        db: Optional[Session] = None
    ) -> Dict[str, Any]:
        """
        Retrieves long-term satellite agroclimatology from NASA POWER API.
        Includes 24-hour database caching.
        """
        param_str = f"years={start_year}_{end_year}"
        resp_hash = cls._compute_hash("NASA_POWER", lat, lon, param_str)

        if db:
            cached = (
                db.query(ClimateCache)
                .filter(ClimateCache.response_hash == resp_hash)
                .order_by(ClimateCache.retrieved_at.desc())
                .first()
            )
            if cached and cached.expires_at > datetime.utcnow():
                return {
                    "provider": "NASA POWER API",
                    "status": "cached",
                    "retrieved_at": cached.retrieved_at.isoformat(),
                    "latitude": lat,
                    "longitude": lon,
                    "data": cached.data
                }

        try:
            url = (
                f"{NASA_POWER_URL}?parameters=T2M,PRECTOTCORR,RH2M,ALLSKY_SFC_SW_DWN"
                f"&community=AG&longitude={lon}&latitude={lat}&format=JSON&start={start_year}&end={end_year}"
            )
            with httpx.Client(timeout=10.0) as client:
                resp = client.get(url)
                if resp.status_code == 200:
                    raw = resp.json()
                    props = raw.get("properties", {}).get("parameter", {})
                    t2m = props.get("T2M", {})
                    precip = props.get("PRECTOTCORR", {})
                    rh2m = props.get("RH2M", {})
                    solar = props.get("ALLSKY_SFC_SW_DWN", {})

                    # Format monthly records
                    months = sorted(t2m.keys())
                    monthly_series = []
                    for m in months:
                        if m.endswith("13"):  # NASA POWER annual summary code
                            continue
                        p_val = precip.get(m)
                        t_val = t2m.get(m)
                        rh_val = rh2m.get(m)
                        s_val = solar.get(m)
                        monthly_series.append({
                            "month": f"{m[:4]}-{m[4:]}",
                            "temperature_c": t_val if t_val != -999 else None,
                            "precipitation_mm_day": p_val if p_val != -999 else None,
                            "relative_humidity_pct": rh_val if rh_val != -999 else None,
                            "solar_radiation_mj_m2": s_val if s_val != -999 else None
                        })

                    payload = {
                        "parameter_coverage": ["T2M (Temperature)", "PRECTOTCORR (Precipitation)", "RH2M (Relative Humidity)", "ALLSKY_SFC_SW_DWN (Solar Irradiance)"],
                        "monthly_series": monthly_series[-12:],  # Last 12 months
                        "data_freshness": "NASA POWER 2.0 Climatology Model"
                    }

                    if db:
                        new_cache = ClimateCache(
                            site_id=site_id,
                            provider="NASA_POWER",
                            latitude=lat,
                            longitude=lon,
                            response_hash=resp_hash,
                            data_json=json.dumps(payload),
                            retrieved_at=datetime.utcnow(),
                            expires_at=datetime.utcnow() + timedelta(hours=24)
                        )
                        db.add(new_cache)
                        db.commit()

                    return {
                        "provider": "NASA POWER API",
                        "status": "live",
                        "retrieved_at": datetime.utcnow().isoformat(),
                        "latitude": lat,
                        "longitude": lon,
                        "data": payload
                    }
        except Exception as e:
            logger.warning(f"NASA POWER request failed: {e}")

        return {
            "provider": "NASA POWER API",
            "status": "unavailable",
            "message": "Historical climate data temporarily unavailable from NASA POWER",
            "latitude": lat,
            "longitude": lon,
            "data": None
        }

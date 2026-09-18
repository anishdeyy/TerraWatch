def test_root_health_endpoint(client):
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert data["database"] == "connected"
    assert data["postgis"] == "enabled"
    assert data["map_service"] == "configured"

def test_data_sources_endpoints(client):
    response = client.get("/api/data-sources")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) >= 5
    first = data[0]
    assert "id" in first
    assert "provider" in first
    assert "source_type" in first

    # Check detail
    detail_res = client.get(f"/api/data-sources/{first['id']}")
    assert detail_res.status_code == 200
    assert detail_res.json()["id"] == first["id"]

def test_site_preview_draw(client):
    # Sample triangle polygon in Western Ghats
    poly = {
        "type": "Polygon",
        "coordinates": [
            [[73.5, 18.5], [73.55, 18.5], [73.52, 18.55], [73.5, 18.5]]
        ]
    }
    response = client.post("/api/sites/preview-draw", json={"geometry": poly})
    assert response.status_code == 200
    data = response.json()
    assert data["area_hectares"] > 0
    assert "latitude" in data
    assert "longitude" in data
    assert "suggested_ecological_type" in data
    assert isinstance(data["nearby_sites"], list)

def test_site_provenance_and_soil(client):
    # Check site 1
    prov_res = client.get("/api/sites/1/provenance")
    assert prov_res.status_code == 200
    p_data = prov_res.json()
    assert "provenance" in p_data
    assert isinstance(p_data["provenance"], list)

    soil_res = client.get("/api/sites/1/soil")
    assert soil_res.status_code == 200
    s_data = soil_res.json()
    assert "observed_soil" in s_data
    assert "state_nutrient_benchmark" in s_data

def test_regional_indicators_endpoint(client):
    res = client.get("/api/regional/indicators?country=India")
    assert res.status_code == 200
    data = res.json()
    assert isinstance(data, list)

def test_get_sites_and_geojson(client):
    response = client.get("/api/sites")
    assert response.status_code == 200
    sites = response.json()
    assert len(sites) >= 15

    geojson_resp = client.get("/api/sites/geojson")
    assert geojson_resp.status_code == 200
    gj = geojson_resp.json()
    assert gj["type"] == "FeatureCollection"
    assert len(gj["features"]) >= 15
    f0 = gj["features"][0]
    assert f0["geometry"]["type"] == "Polygon"
    assert "name" in f0["properties"]

def test_nearby_sites(client):
    # Query near Western Ghats (lat 19.0, lon 73.5)
    response = client.get("/api/sites/nearby?lat=19.07&lon=73.53&radius_km=150")
    assert response.status_code == 200
    nearby = response.json()
    assert len(nearby) >= 1
    assert any("Bhimashankar" in s["name"] for s in nearby)

def test_export_site_metrics_csv(client):
    response = client.get("/api/sites/1/export/csv")
    assert response.status_code == 200
    assert response.headers["content-type"].startswith("text/csv")
    content = response.text
    assert "carbon_stock" in content
    assert "biodiversity_score" in content
    assert "ndvi" in content
    lines = content.strip().split("\n")
    assert len(lines) >= 2  # Header + rows


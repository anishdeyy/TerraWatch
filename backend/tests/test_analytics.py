def test_site_analytics_and_health_score(client):
    response = client.get("/api/sites/1/analytics")
    assert response.status_code == 200
    data = response.json()
    assert "health_score" in data
    assert "overall_score" in data["health_score"]
    assert data["health_score"]["overall_score"] > 0
    assert "breakdown" in data["health_score"]
    assert "biodiversity" in data["health_score"]["breakdown"]

def test_alerts_endpoint(client):
    response = client.get("/api/alerts")
    assert response.status_code == 200
    alerts = response.json()
    assert isinstance(alerts, list)

def test_site_health_index_endpoint(client):
    response = client.get("/api/sites/1/health-index")
    assert response.status_code == 200
    data = response.json()
    assert "score" in data
    assert "components" in data
    assert "biodiversity" in data["components"]
    assert "ndvi" in data["components"]
    assert "carbon" in data["components"]

def test_dashboard_summary_endpoint(client):
    response = client.get("/api/dashboard/summary")
    assert response.status_code == 200
    data = response.json()
    assert "active_projects" in data
    assert "total_sites" in data
    assert "total_area_hectares" in data
    assert "carbon_stock" in data
    assert "biodiversity_score" in data
    assert "ndvi" in data
    assert "water_stress" in data
    assert data["is_demo"] is True

def test_search_endpoint(client):
    response = client.get("/api/search?q=western")
    assert response.status_code == 200
    data = response.json()
    assert "results" in data
    assert isinstance(data["results"], list)


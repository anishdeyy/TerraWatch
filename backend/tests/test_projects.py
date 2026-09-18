def test_get_projects(client):
    response = client.get("/api/projects")
    assert response.status_code == 200
    projects = response.json()
    assert len(projects) >= 5
    first = projects[0]
    assert "name" in first
    assert "project_type" in first
    assert "site_count" in first
    assert first["site_count"] > 0

def test_get_single_project(client):
    response = client.get("/api/projects/1")
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == 1
    assert "Western Ghats" in data["name"]

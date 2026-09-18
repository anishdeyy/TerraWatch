def test_health_check(client):
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["platform"] == "TerraWatch"

def test_admin_login(client):
    response = client.post("/api/auth/login", json={
        "email": "admin@demo.terrawatch.earth",
        "password": "TerraWatch2026!"
    })
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["user"]["email"] == "admin@demo.terrawatch.earth"
    assert data["user"]["role"] == "ADMIN"

def test_invalid_login(client):
    response = client.post("/api/auth/login", json={
        "email": "admin@demo.terrawatch.earth",
        "password": "WrongPassword123!"
    })
    assert response.status_code == 401

def test_user_registration(client):
    response = client.post("/api/auth/register", json={
        "name": "Test Ecological Researcher",
        "email": "researcher_test@terrawatch.earth",
        "password": "SecurePassword2026!",
        "role": "ANALYST"
    })
    assert response.status_code == 201
    data = response.json()
    assert data["user"]["email"] == "researcher_test@terrawatch.earth"
    assert data["user"]["role"] == "ANALYST"


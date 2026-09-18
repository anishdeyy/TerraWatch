def test_site_summary_ai(client):
    response = client.post("/api/ai/site-summary", json={"site_id": 1})
    assert response.status_code == 200
    data = response.json()
    assert "summary" in data
    assert "key_findings" in data
    assert "recommended_actions" in data
    assert len(data["key_findings"]) > 0

def test_ask_ai(client):
    response = client.post("/api/ai/ask", json={
        "question": "Which site has the highest carbon stock?"
    })
    assert response.status_code == 200
    data = response.json()
    assert "answer" in data
    assert len(data["referenced_sites"]) > 0

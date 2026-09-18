def test_packages_list(client):
    response = client.get("/api/payments/packages")
    assert response.status_code == 200
    pkgs = response.json()
    assert len(pkgs) == 3
    ids = [p["id"] for p in pkgs]
    assert "explorer" in ids
    assert "professional" in ids
    assert "enterprise" in ids

def test_create_order_and_verify(client):
    # Log in first
    login_resp = client.post("/api/auth/login", json={
        "email": "admin@demo.terrawatch.earth",
        "password": "TerraWatch2026!"
    })
    token = login_resp.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    order_resp = client.post("/api/payments/create-order", json={"package_id": "professional"}, headers=headers)
    assert order_resp.status_code == 200
    order_data = order_resp.json()
    assert "order_id" in order_data
    assert order_data["amount"] == 49900

    # Verify payment with mock signature
    verify_resp = client.post("/api/payments/verify", json={
        "razorpay_order_id": order_data["order_id"],
        "razorpay_payment_id": "pay_test_123456",
        "razorpay_signature": "mock_sig_valid",
        "package_id": "professional"
    }, headers=headers)
    assert verify_resp.status_code == 200
    assert verify_resp.json()["success"] is True

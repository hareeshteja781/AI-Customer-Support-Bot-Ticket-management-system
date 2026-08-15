from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_register_new_customer():
    response = client.post(
        "/api/auth/register",
        json={"email": "new.customer@example.com", "password": "newpass123", "full_name": "New Customer"},
    )
    assert response.status_code == 200
    assert response.json()["user"]["role"] == "customer"


def test_customer_tickets_endpoint_filters_by_user():
    login = client.post(
        "/api/auth/login",
        json={"email": "customer@example.com", "password": "password"},
    )
    token = login.json()["access_token"]
    response = client.get("/api/tickets", headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 200
    assert response.json()[0]["customer_email"] == "customer@example.com"


def test_analytics_endpoint_returns_metrics():
    login = client.post(
        "/api/auth/login",
        json={"email": "admin@example.com", "password": "adm123"},
    )
    token = login.json()["access_token"]
    response = client.get("/api/analytics/overview", headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 200
    assert "total_tickets" in response.json()


def test_document_upload_persists_uploaded_file():
    login = client.post(
        "/api/auth/login",
        json={"email": "admin@example.com", "password": "adm123"},
    )
    token = login.json()["access_token"]
    response = client.post(
        "/api/documents/upload",
        files={"file": ("support_policy.txt", "Refunds are available within 30 days for eligible purchases.", "text/plain")},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 200
    assert response.json()["filename"] == "support_policy.txt"
    assert response.json()["status"] == "ready"

    list_response = client.get("/api/documents", headers={"Authorization": f"Bearer {token}"})
    assert list_response.status_code == 200
    assert any(item["filename"] == "support_policy.txt" for item in list_response.json())

from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_health_check():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"


def test_login_success():
    response = client.post(
        "/api/auth/login",
        json={"email": "customer@example.com", "password": "password"},
    )
    assert response.status_code == 200
    assert response.json()["user"]["role"] == "customer"


def test_create_ticket_requires_auth():
    response = client.post("/api/tickets", json={"title": "Test", "description": "Hello"})
    assert response.status_code == 401


def test_create_ticket_with_auth():
    login = client.post(
        "/api/auth/login",
        json={"email": "customer@example.com", "password": "password"},
    )
    token = login.json()["access_token"]
    response = client.post(
        "/api/tickets",
        json={"title": "Billing", "description": "Need help"},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 200
    assert response.json()["title"] == "Billing"

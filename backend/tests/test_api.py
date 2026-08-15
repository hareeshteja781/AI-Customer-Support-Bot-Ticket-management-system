import os

os.environ["TEST_DATABASE_URL"] = "sqlite://"
os.environ["JWT_SECRET_KEY"] = "test-secret-that-is-at-least-32-bytes-long"

from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def login(email="customer@example.com", password="password"):
    response = client.post("/api/auth/login", json={"email": email, "password": password})
    assert response.status_code == 200, response.text
    return response.json()["access_token"]


def test_health():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_login_and_profile():
    token = login()
    response = client.get("/api/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 200
    assert response.json()["full_name"] == "Customer User"


def test_register_uses_full_name_and_returns_token():
    response = client.post(
        "/api/auth/register",
        json={"full_name": "Test User", "email": "test-user@example.com", "password": "password123"},
    )
    assert response.status_code == 200
    assert response.json()["user"]["full_name"] == "Test User"


def test_ticket_contract():
    token = login()
    headers = {"Authorization": f"Bearer {token}"}
    response = client.get("/api/tickets", headers=headers)
    assert response.status_code == 200
    ticket = response.json()[0]
    assert ticket["ticket_number"].startswith("TKT-")
    assert "updated_at" in ticket


def test_conversation_contract():
    token = login()
    headers = {"Authorization": f"Bearer {token}"}
    response = client.post("/api/chat/conversations", headers=headers)
    assert response.status_code == 200
    conversation = response.json()
    assert "status" in conversation
    assert "created_at" in conversation
    detail = client.get(f"/api/chat/conversations/{conversation['id']}", headers=headers)
    assert detail.status_code == 200
    assert detail.json()["messages"] == []

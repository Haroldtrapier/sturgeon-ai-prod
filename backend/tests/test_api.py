"""
API endpoint tests
"""
import pytest
from fastapi.testclient import TestClient


def test_root_endpoint(client):
    """Test root endpoint returns service info"""
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["service"] == "Sturgeon AI API"
    assert data["version"] == "2.0.0"
    assert "endpoints" in data


def test_health_endpoint(client):
    """Test health check endpoint"""
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "timestamp" in data


def test_opportunities_search(client):
    """Test opportunities search endpoint"""
    response = client.get("/api/opportunities/search?keywords=software&limit=10")
    assert response.status_code == 200
    data = response.json()
    assert "success" in data


def test_grants_search(client):
    """Test grants search endpoint"""
    response = client.get("/api/grants/search?keywords=technology&limit=10")
    assert response.status_code == 200
    data = response.json()
    assert "success" in data


def test_contract_analysis(client):
    """Test contract analysis endpoint"""
    payload = {
        "contract_text": "Test contract for analysis",
        "analysis_type": "full"
    }
    response = client.post("/api/ai/analyze-contract", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert "analysis" in data


def test_agent_ask(client):
    """Test agent endpoint"""
    payload = {
        "message": "What is a NAICS code?",
        "user_id": "test-user"
    }
    response = client.post("/agent/ask", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "response" in data

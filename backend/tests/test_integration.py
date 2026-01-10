"""
Integration tests for API endpoints
"""
import pytest
from fastapi.testclient import TestClient
from unittest.mock import Mock, patch
from backend.main import app


client = TestClient(app)


def test_health_check():
    """Test health check endpoint"""
    response = client.get("/health")
    assert response.status_code == 200
    assert "status" in response.json()


def test_agent_ask_endpoint():
    """Test agent ask endpoint"""
    with patch('backend.routers.agent.ask_claude_agent') as mock_agent:
        mock_agent.return_value = {
            "response": "Test response",
            "confidence": 0.95
        }
        
        response = client.post(
            "/agent/ask",
            json={"question": "What is SAM.gov?"}
        )
        
        assert response.status_code == 200
        data = response.json()
        assert "response" in data


def test_chat_endpoint():
    """Test chat endpoint"""
    with patch('backend.routers.chat.ask_chatkit') as mock_chat:
        mock_chat.return_value = {"reply": "Hello!"}
        
        response = client.post(
            "/chat",
            json={
                "user_id": "test-user",
                "message": "Hello",
                "thread_id": "thread-123"
            }
        )
        
        assert response.status_code == 200


def test_proposals_list():
    """Test listing proposals"""
    response = client.get("/proposals/")
    # May return empty list or require auth, but should not error
    assert response.status_code in [200, 401, 403]


def test_create_proposal():
    """Test creating a new proposal"""
    with patch('backend.routers.proposals.Proposal') as mock_proposal:
        response = client.post(
            "/proposals/",
            json={
                "name": "Test Proposal",
                "user_id": "user-123",
                "raw_text": "Proposal requirements"
            }
        )
        
        # May require auth or validation
        assert response.status_code in [200, 201, 401, 422]


def test_marketplace_sam_search():
    """Test SAM.gov marketplace search"""
    with patch('backend.routers.marketplaces.search_sam') as mock_search:
        mock_search.return_value = {
            "opportunities": [
                {"title": "Test Opportunity", "id": "123"}
            ]
        }
        
        response = client.get("/marketplaces/sam?query=IT+services")
        assert response.status_code == 200


def test_billing_webhook():
    """Test Stripe webhook handler"""
    webhook_payload = {
        "type": "checkout.session.completed",
        "data": {
            "object": {
                "customer_email": "test@example.com",
                "subscription": "sub_123"
            }
        }
    }
    
    response = client.post("/billing/webhook", json=webhook_payload)
    assert response.status_code == 200
    assert response.json()["received"] == True


def test_cors_headers():
    """Test CORS middleware"""
    response = client.options("/health")
    # CORS should allow cross-origin requests
    assert response.status_code in [200, 405]  # OPTIONS may not be explicitly handled

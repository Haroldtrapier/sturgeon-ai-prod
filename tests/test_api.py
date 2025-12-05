"""
Tests for the Sturgeon AI API endpoints
"""
from fastapi.testclient import TestClient
from unittest.mock import AsyncMock, patch
from backend.main import app

client = TestClient(app)


def test_root_endpoint_includes_agent():
    """Test that root endpoint lists the agent endpoint"""
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert "agent" in data["endpoints"]
    assert data["endpoints"]["agent"] == "/api/ai/agent"


@patch('backend.main.run_agent', new_callable=AsyncMock)
def test_agent_chat_endpoint(mock_run_agent):
    """Test the agent chat endpoint"""
    mock_run_agent.return_value = "This is a government contracting answer"

    response = client.post(
        "/api/ai/agent",
        json={"message": "What is an RFQ?", "user_id": "test-user"}
    )

    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["response"] == "This is a government contracting answer"
    assert "timestamp" in data
    mock_run_agent.assert_called_once_with("What is an RFQ?", "test-user")


@patch('backend.main.run_agent', new_callable=AsyncMock)
def test_agent_chat_endpoint_without_user_id(mock_run_agent):
    """Test the agent chat endpoint without user_id"""
    mock_run_agent.return_value = "Response without user ID"

    response = client.post(
        "/api/ai/agent",
        json={"message": "Tell me about NAICS codes"}
    )

    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["response"] == "Response without user ID"
    mock_run_agent.assert_called_once_with("Tell me about NAICS codes", None)


@patch('backend.main.run_agent', new_callable=AsyncMock)
def test_agent_chat_endpoint_error_handling(mock_run_agent):
    """Test that agent endpoint handles errors properly"""
    mock_run_agent.side_effect = Exception("OpenAI API Error")

    response = client.post(
        "/api/ai/agent",
        json={"message": "Test message"}
    )

    assert response.status_code == 500
    assert "OpenAI API Error" in response.json()["detail"]

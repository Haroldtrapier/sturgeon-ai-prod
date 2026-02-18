"""
API tests for Sturgeon AI backend.
Tests critical endpoints and agent functionality.
"""
import pytest
import os
import sys

# Ensure backend directory is in path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))


def test_health_endpoint():
    """Test health check endpoint returns expected fields."""
    from fastapi.testclient import TestClient
    from app import app

    client = TestClient(app)
    response = client.get("/health")

    assert response.status_code == 200
    data = response.json()
    assert data["ok"] is True
    assert data["service"] == "sturgeon-ai-backend"
    assert data["version"] == "9.0.0"
    assert "routers_loaded" in data
    assert "env" in data


def test_root_endpoint():
    """Test root endpoint returns service info."""
    from fastapi.testclient import TestClient
    from app import app

    client = TestClient(app)
    response = client.get("/")

    assert response.status_code == 200
    data = response.json()
    assert data["service"] == "Sturgeon AI API"
    assert "features" in data
    assert len(data["features"]) > 0


def test_opportunities_list():
    """Test opportunity listing endpoint."""
    from fastapi.testclient import TestClient
    from app import app

    client = TestClient(app)
    response = client.get("/api/opportunities")

    assert response.status_code == 200
    data = response.json()
    assert "opportunities" in data
    assert "total" in data


def test_agents_available():
    """Test agents listing endpoint."""
    from fastapi.testclient import TestClient
    from app import app

    client = TestClient(app)
    response = client.get("/api/agents/available")

    assert response.status_code == 200
    data = response.json()
    assert "agents" in data
    agents = data["agents"]
    assert len(agents) == 6

    agent_ids = {a["id"] for a in agents}
    assert "research" in agent_ids
    assert "opportunity" in agent_ids
    assert "compliance" in agent_ids
    assert "proposal" in agent_ids
    assert "market" in agent_ids
    assert "general" in agent_ids


def test_certification_types():
    """Test certification types endpoint."""
    from fastapi.testclient import TestClient
    from app import app

    client = TestClient(app)
    response = client.get("/api/certifications/available/types")

    assert response.status_code == 200
    data = response.json()
    assert "certification_types" in data

    types = {t["type"] for t in data["certification_types"]}
    assert "SDVOSB" in types
    assert "8a" in types
    assert "HUBZone" in types
    assert "WOSB" in types


def test_certification_requirements():
    """Test certification requirements endpoint."""
    from fastapi.testclient import TestClient
    from app import app

    client = TestClient(app)
    response = client.get("/api/certifications/requirements/SDVOSB")

    assert response.status_code == 200
    data = response.json()
    assert data["type"] == "SDVOSB"
    assert "requirements" in data
    assert len(data["requirements"]) > 0


def test_certification_unknown_type():
    """Test certification requirements with unknown type."""
    from fastapi.testclient import TestClient
    from app import app

    client = TestClient(app)
    response = client.get("/api/certifications/requirements/UNKNOWN")

    assert response.status_code == 404


def test_legacy_agent_chat():
    """Test legacy agent chat endpoint."""
    from fastapi.testclient import TestClient
    from app import app

    client = TestClient(app)
    response = client.post("/agent/chat", json={
        "message": "Hello",
        "context": {"agentType": "general"},
    })

    assert response.status_code == 200
    data = response.json()
    assert "reply" in data
    assert "metadata" in data


def test_agent_classes_instantiate():
    """Test all agent classes can be instantiated."""
    from agents import AGENT_REGISTRY, list_agents

    assert len(AGENT_REGISTRY) == 6
    agents = list_agents()
    assert len(agents) == 6

    for agent_info in agents:
        assert "id" in agent_info
        assert "name" in agent_info
        assert "description" in agent_info


def test_agent_system_prompts():
    """Test all agents have non-empty system prompts."""
    from agents import AGENT_REGISTRY

    for agent_id, agent in AGENT_REGISTRY.items():
        assert agent.system_prompt, f"Agent {agent_id} has empty system prompt"
        assert len(agent.system_prompt) > 50, f"Agent {agent_id} system prompt is too short"


def test_llm_service_imports():
    """Test LLM service imports correctly."""
    from services.llm import llm_chat, allm_chat
    assert callable(llm_chat)
    assert callable(allm_chat)


def test_integration_clients():
    """Test integration clients can be imported."""
    from integrations.fpds_client import FPDSClient, fpds_client
    from integrations.usaspending_client import USASpendingClient, usaspending_client

    assert isinstance(fpds_client, FPDSClient)
    assert isinstance(usaspending_client, USASpendingClient)


def test_sam_client():
    """Test SAM.gov client can be imported."""
    from services.sam_gov import SAMGovClient, sam_client
    assert isinstance(sam_client, SAMGovClient)

"""
Tests for the proposals router
"""
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from unittest.mock import MagicMock
import uuid
from datetime import datetime

import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from main import app
from database import Base, get_db
from models import User, Proposal
from dependencies import get_current_user

# Create test database
SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Create tables
Base.metadata.create_all(bind=engine)


def override_get_db():
    """Override get_db for testing"""
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()


def override_get_current_user():
    """Override get_current_user for testing"""
    # Return a mock user with a test UUID
    user = User(
        id=uuid.UUID('12345678-1234-5678-1234-567812345678'),
        full_name="Test User",
        company_name="Test Company"
    )
    return user


# Override dependencies
app.dependency_overrides[get_db] = override_get_db
app.dependency_overrides[get_current_user] = override_get_current_user

client = TestClient(app)


def setup_test_data():
    """Create test data"""
    db = TestingSessionLocal()
    
    # Create test user
    test_user = User(
        id=uuid.UUID('12345678-1234-5678-1234-567812345678'),
        full_name="Test User",
        company_name="Test Company"
    )
    db.add(test_user)
    
    # Create test proposal
    test_proposal = Proposal(
        id=1,
        user_id=test_user.id,
        opportunity_id=uuid.uuid4(),
        title="Original Title",
        body="Original Body",
        status="draft",
        content={}
    )
    db.add(test_proposal)
    
    db.commit()
    db.close()


def teardown_test_data():
    """Clean up test data"""
    db = TestingSessionLocal()
    db.query(Proposal).delete()
    db.query(User).delete()
    db.commit()
    db.close()


def test_update_proposal_title():
    """Test updating proposal title"""
    setup_test_data()
    
    response = client.put(
        "/proposals/1",
        json={"title": "Updated Title"},
        headers={"Authorization": "Bearer test-token"}
    )
    
    assert response.status_code == 200
    data = response.json()
    assert data["title"] == "Updated Title"
    assert data["body"] == "Original Body"  # Should remain unchanged
    assert data["status"] == "draft"  # Should remain unchanged
    
    teardown_test_data()


def test_update_proposal_body():
    """Test updating proposal body"""
    setup_test_data()
    
    response = client.put(
        "/proposals/1",
        json={"body": "Updated Body"},
        headers={"Authorization": "Bearer test-token"}
    )
    
    assert response.status_code == 200
    data = response.json()
    assert data["title"] == "Original Title"  # Should remain unchanged
    assert data["body"] == "Updated Body"
    assert data["status"] == "draft"  # Should remain unchanged
    
    teardown_test_data()


def test_update_proposal_status():
    """Test updating proposal status"""
    setup_test_data()
    
    response = client.put(
        "/proposals/1",
        json={"status": "review"},
        headers={"Authorization": "Bearer test-token"}
    )
    
    assert response.status_code == 200
    data = response.json()
    assert data["title"] == "Original Title"  # Should remain unchanged
    assert data["body"] == "Original Body"  # Should remain unchanged
    assert data["status"] == "review"
    
    teardown_test_data()


def test_update_proposal_all_fields():
    """Test updating all fields at once"""
    setup_test_data()
    
    response = client.put(
        "/proposals/1",
        json={
            "title": "New Title",
            "body": "New Body",
            "status": "submitted"
        },
        headers={"Authorization": "Bearer test-token"}
    )
    
    assert response.status_code == 200
    data = response.json()
    assert data["title"] == "New Title"
    assert data["body"] == "New Body"
    assert data["status"] == "submitted"
    
    teardown_test_data()


def test_update_nonexistent_proposal():
    """Test updating a proposal that doesn't exist"""
    setup_test_data()
    
    response = client.put(
        "/proposals/999",
        json={"title": "Updated Title"},
        headers={"Authorization": "Bearer test-token"}
    )
    
    assert response.status_code == 404
    assert response.json()["detail"] == "Proposal not found"
    
    teardown_test_data()


def test_update_proposal_partial_update():
    """Test that None values don't update fields"""
    setup_test_data()
    
    # First update only title
    response = client.put(
        "/proposals/1",
        json={"title": "Title Only Update"},
        headers={"Authorization": "Bearer test-token"}
    )
    
    assert response.status_code == 200
    data = response.json()
    assert data["title"] == "Title Only Update"
    assert data["body"] == "Original Body"  # Should remain unchanged
    
    teardown_test_data()


if __name__ == "__main__":
    # Run tests manually for verification
    print("Running tests...")
    test_update_proposal_title()
    print("✓ test_update_proposal_title passed")
    
    test_update_proposal_body()
    print("✓ test_update_proposal_body passed")
    
    test_update_proposal_status()
    print("✓ test_update_proposal_status passed")
    
    test_update_proposal_all_fields()
    print("✓ test_update_proposal_all_fields passed")
    
    test_update_nonexistent_proposal()
    print("✓ test_update_nonexistent_proposal passed")
    
    test_update_proposal_partial_update()
    print("✓ test_update_proposal_partial_update passed")
    
    print("\n✓ All tests passed!")

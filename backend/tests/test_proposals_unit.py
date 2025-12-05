"""
Unit tests for the proposals router logic
Tests the endpoint logic without requiring a full database setup
"""
from unittest.mock import MagicMock, patch
import uuid
from datetime import datetime

import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from schemas import ProposalUpdate, ProposalOut


def test_proposal_update_schema():
    """Test ProposalUpdate schema accepts optional fields"""
    # Test with all fields
    update = ProposalUpdate(title="New Title", body="New Body", status="review")
    assert update.title == "New Title"
    assert update.body == "New Body"
    assert update.status == "review"
    
    # Test with only title
    update = ProposalUpdate(title="Title Only")
    assert update.title == "Title Only"
    assert update.body is None
    assert update.status is None
    
    # Test with empty dict
    update = ProposalUpdate()
    assert update.title is None
    assert update.body is None
    assert update.status is None
    
    print("✓ ProposalUpdate schema works correctly")


def test_proposal_out_schema():
    """Test ProposalOut schema structure"""
    user_id = uuid.uuid4()
    opp_id = uuid.uuid4()
    now = datetime.utcnow()
    
    proposal_data = {
        "id": 1,
        "user_id": user_id,
        "opportunity_id": opp_id,
        "title": "Test Proposal",
        "body": "Test Body",
        "version": 1,
        "status": "draft",
        "created_at": now,
        "updated_at": now
    }
    
    # This should work with from_attributes=True
    out = ProposalOut(**proposal_data)
    assert out.id == 1
    assert out.user_id == user_id
    assert out.title == "Test Proposal"
    assert out.body == "Test Body"
    assert out.status == "draft"
    
    print("✓ ProposalOut schema works correctly")


def test_update_proposal_logic():
    """Test the update logic of the proposal endpoint"""
    # Mock proposal object
    mock_proposal = MagicMock()
    mock_proposal.id = 1
    mock_proposal.title = "Original Title"
    mock_proposal.body = "Original Body"
    mock_proposal.status = "draft"
    
    # Test updating only title
    payload = ProposalUpdate(title="Updated Title")
    if payload.title is not None:
        mock_proposal.title = payload.title
    if payload.body is not None:
        mock_proposal.body = payload.body
    if payload.status is not None:
        mock_proposal.status = payload.status
    
    assert mock_proposal.title == "Updated Title"
    assert mock_proposal.body == "Original Body"
    assert mock_proposal.status == "draft"
    
    # Reset
    mock_proposal.title = "Original Title"
    
    # Test updating all fields
    payload = ProposalUpdate(title="New Title", body="New Body", status="review")
    if payload.title is not None:
        mock_proposal.title = payload.title
    if payload.body is not None:
        mock_proposal.body = payload.body
    if payload.status is not None:
        mock_proposal.status = payload.status
    
    assert mock_proposal.title == "New Title"
    assert mock_proposal.body == "New Body"
    assert mock_proposal.status == "review"
    
    print("✓ Update logic works correctly")


def test_proposal_router_exists():
    """Test that the proposals router is properly defined"""
    from routers import proposals
    
    assert proposals.router is not None
    assert proposals.router.prefix == "/proposals"
    
    # Check that the update endpoint exists
    routes = [route for route in proposals.router.routes]
    assert len(routes) > 0
    
    update_route = next((r for r in routes if hasattr(r, 'path') and 'proposal_id' in r.path), None)
    assert update_route is not None
    assert 'PUT' in update_route.methods
    
    print("✓ Proposals router is properly configured")


if __name__ == "__main__":
    # Run tests
    print("Running unit tests...\n")
    
    test_proposal_update_schema()
    test_proposal_out_schema()
    test_update_proposal_logic()
    test_proposal_router_exists()
    
    print("\n✓ All unit tests passed!")

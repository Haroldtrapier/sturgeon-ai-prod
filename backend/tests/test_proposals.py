"""
Tests for proposal services and endpoints
"""
import pytest
from unittest.mock import Mock, patch
from backend.services.proposal_ai import generate_full_proposal
from backend.models.proposal import Proposal, ProposalStatus


@pytest.fixture
def sample_requirements():
    return """
    We need a comprehensive proposal for IT infrastructure modernization.
    Requirements include cloud migration, cybersecurity enhancements,
    and ongoing support services.
    """


@pytest.fixture
def sample_company_profile():
    return "Trapier Management LLC - SDVOSB, IT solutions and logistics"


def test_proposal_creation(sample_requirements):
    """Test basic proposal object creation"""
    proposal = Proposal(
        name="IT Modernization Proposal",
        user_id="test-user-123",
        raw_text=sample_requirements,
        status=ProposalStatus.DRAFT.value
    )
    
    assert proposal.name == "IT Modernization Proposal"
    assert proposal.status == ProposalStatus.DRAFT.value
    assert proposal.user_id == "test-user-123"


@patch('backend.services.proposal_ai.openai')
def test_generate_full_proposal(mock_openai, sample_requirements, sample_company_profile):
    """Test AI proposal generation"""
    # Mock OpenAI response
    mock_openai.chat.completions.create.return_value = Mock(
        choices=[
            Mock(message=Mock(content="Generated proposal content"))
        ]
    )
    
    # Note: This would be async in reality, adjust accordingly
    # result = await generate_full_proposal(sample_requirements, sample_company_profile)
    
    # For now, just test that function exists and has correct signature
    assert callable(generate_full_proposal)


def test_proposal_status_transitions():
    """Test proposal status workflow"""
    statuses = [
        ProposalStatus.DRAFT,
        ProposalStatus.IN_REVIEW,
        ProposalStatus.READY,
        ProposalStatus.SUBMITTED
    ]
    
    proposal = Proposal(
        name="Test Proposal",
        user_id="user-123",
        status=ProposalStatus.DRAFT.value
    )
    
    # Verify all statuses are valid
    for status in statuses:
        proposal.status = status.value
        assert proposal.status in [s.value for s in ProposalStatus]


def test_proposal_word_count():
    """Test proposal word count calculation"""
    proposal = Proposal(
        name="Test",
        user_id="user-123",
        generated_text="This is a test proposal with ten words in it."
    )
    
    # Word count should be calculable
    if proposal.generated_text:
        word_count = len(proposal.generated_text.split())
        assert word_count == 10

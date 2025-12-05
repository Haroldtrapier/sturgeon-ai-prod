"""
Tests for the Sturgeon AI agent
"""
import pytest
from unittest.mock import AsyncMock, patch, MagicMock
from backend.agent import run_agent, SYSTEM_PROMPT


@pytest.mark.asyncio
async def test_run_agent_basic():
    """Test that run_agent calls OpenAI API correctly"""
    mock_client = MagicMock()
    mock_response = MagicMock()
    mock_response.choices = [MagicMock()]
    mock_response.choices[0].message.content = "This is a test response"
    mock_client.chat.completions.create = AsyncMock(return_value=mock_response)

    with patch('backend.agent._get_client', return_value=mock_client):
        result = await run_agent("What is a NAICS code?", "test-user-123")

        assert result == "This is a test response"
        mock_client.chat.completions.create.assert_called_once()
        call_args = mock_client.chat.completions.create.call_args
        assert call_args[1]["model"] == "gpt-4"
        assert len(call_args[1]["messages"]) == 2
        assert call_args[1]["messages"][0]["role"] == "system"
        assert call_args[1]["messages"][0]["content"] == SYSTEM_PROMPT
        assert call_args[1]["messages"][1]["role"] == "user"
        assert call_args[1]["messages"][1]["content"] == "What is a NAICS code?"


@pytest.mark.asyncio
async def test_run_agent_without_user_id():
    """Test that run_agent works without user_id"""
    mock_client = MagicMock()
    mock_response = MagicMock()
    mock_response.choices = [MagicMock()]
    mock_response.choices[0].message.content = "Response without user ID"
    mock_client.chat.completions.create = AsyncMock(return_value=mock_response)

    with patch('backend.agent._get_client', return_value=mock_client):
        result = await run_agent("Test message")

        assert result == "Response without user ID"
        mock_client.chat.completions.create.assert_called_once()


@pytest.mark.asyncio
async def test_run_agent_no_api_key():
    """Test that run_agent raises error when API key is not set"""
    with patch('backend.agent._get_client', return_value=None):
        with pytest.raises(ValueError, match="OPENAI_API_KEY environment variable is not set"):
            await run_agent("Test message")

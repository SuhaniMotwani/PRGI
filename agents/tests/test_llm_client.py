"""Tests for agents.llm_client."""

import os
from unittest.mock import MagicMock, patch
import pytest
from agents.llm_client import call_llm


def test_call_llm_missing_api_key(monkeypatch):
    monkeypatch.delenv("GROQ_API_KEY", raising=False)
    with pytest.raises(RuntimeError, match="GROQ_API_KEY environment variable is not set"):
        call_llm("test prompt")


def test_call_llm_success(monkeypatch):
    monkeypatch.setenv("GROQ_API_KEY", "mock-groq-key")
    with patch("agents.llm_client.Groq") as mock_groq_cls:
        mock_instance = MagicMock()
        mock_groq_cls.return_value = mock_instance
        
        mock_choice = MagicMock()
        mock_choice.message.content = "Mocked LLM Response"
        mock_instance.chat.completions.create.return_value = MagicMock(choices=[mock_choice])
        
        result = call_llm("Generate a title", model="openai/gpt-oss-120b")
        assert result == "Mocked LLM Response"
        mock_instance.chat.completions.create.assert_called_once_with(
            model="openai/gpt-oss-120b",
            messages=[{"role": "user", "content": "Generate a title"}],
        )


def test_direct_call_llm_patching():
    """Verify that any agent code can directly patch agents.llm_client.call_llm."""
    with patch("agents.llm_client.call_llm", return_value="Mocked Direct Content") as mock_fn:
        from agents.llm_client import call_llm as client_call
        res = client_call("Any prompt")
        assert res == "Mocked Direct Content"
        mock_fn.assert_called_once_with("Any prompt")

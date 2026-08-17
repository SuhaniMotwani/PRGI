import os
from unittest.mock import patch, MagicMock
import pytest
from services.agent_service.llm_client import call_llm


def test_call_llm_missing_key():
    with patch.dict(os.environ, {}, clear=True):
        with pytest.raises(RuntimeError, match="GEMINI_API_KEY environment variable is not set"):
            call_llm("test prompt")


def test_call_llm_with_mock_gemini():
    with patch.dict(os.environ, {"GEMINI_API_KEY": "fake_test_key"}):
        with patch("google.genai.Client") as mock_client_cls:
            mock_client = MagicMock()
            mock_response = MagicMock()
            mock_response.text = '["Mock Title 1", "Mock Title 2"]'
            mock_client.models.generate_content.return_value = mock_response
            mock_client_cls.return_value = mock_client

            res = call_llm("Generate titles")
            assert res == '["Mock Title 1", "Mock Title 2"]'
            mock_client.models.generate_content.assert_called_once_with(
                model="gemini-2.0-flash", contents="Generate titles"
            )

import json
from unittest.mock import patch
import pytest
from fastapi.testclient import TestClient
from agents.api import app

client = TestClient(app, raise_server_exceptions=False)


def test_health_check():
    response = client.get("/v1/agents/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_generate_titles_endpoint_mocked():
    mock_ranked = [
        {
            "title": "Sahyadri Prabhat",
            "confidenceScore": 95.0,
            "verdict": "APPROVED",
            "reasoning": "Verified clean (95% confidence): High uniqueness",
        },
        {
            "title": "Konkan Varta",
            "confidenceScore": 90.0,
            "verdict": "APPROVED",
            "reasoning": "Verified clean (90% confidence): Strong distinctive root",
        },
    ]

    with patch("agents.api.build_graph") as mock_graph_builder:
        mock_graph = mock_graph_builder.return_value
        mock_graph.invoke.return_value = {"final_ranked": mock_ranked}

        response = client.post(
            "/v1/agents/generate-titles",
            json={
                "scope": "regional daily news",
                "region": "Maharashtra",
                "language": "Marathi",
                "audience": "general public",
            },
        )
        assert response.status_code == 200
        data = response.json()
        assert "suggestedAlternatives" in data
        assert len(data["suggestedAlternatives"]) == 2
        assert data["suggestedAlternatives"][0]["title"] == "Sahyadri Prabhat"
        assert data["suggestedAlternatives"][0]["confidenceScore"] == 95.0
        assert data["suggestedAlternatives"][0]["verdict"] == "APPROVED"


def test_structured_error_handler():
    with patch("agents.api.build_graph", side_effect=ValueError("Graph execution error")):
        response = client.post(
            "/v1/agents/generate-titles",
            json={"region": "Maharashtra"},
        )
        assert response.status_code == 500
        data = response.json()
        assert "error" in data
        assert data["error"]["code"] == "INTERNAL_ERROR"
        assert "Graph execution error" in data["error"]["message"]

"""Tests for agent workflow graph."""

from unittest.mock import patch
from agents.workflow.graph import build_graph


def test_full_workflow_execution():
    mock_llm_json = (
        '["Sahyadri Vaarta", "Konkan Prabhat", "Godavari Sandesh", '
        '"Vidarbha Janmat", "Marathwada Darpan", "Pune Varta"]'
    )
    
    with patch("agents.generator.generator.call_llm", return_value=mock_llm_json) as mock_llm:
        graph = build_graph()
        state = {
            "brief": {
                "scope": "regional daily news",
                "region": "Maharashtra",
                "language": "Marathi",
                "audience": "general public",
            },
            "candidates": [],
            "passed": [],
            "rejected_log": [],
            "attempt": 0,
            "max_attempts": 4,
            "final_ranked": [],
        }
        result = graph.invoke(state)
        
        assert len(result["final_ranked"]) > 0
        assert len(result["final_ranked"]) <= 5
        assert result["attempt"] >= 1
        for item in result["final_ranked"]:
            assert item["verdict"] == "APPROVED"
            assert "confidence" in item["reasoning"]
            assert 0.0 <= item["confidenceScore"] <= 100.0


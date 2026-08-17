"""Tests for agents.generator."""

import json
from unittest.mock import patch
from agents.generator.generator import generate_candidates


def test_generate_candidates_json_parsing():
    mock_titles = [
        "Sahyadri Prabhat", "Konkan Varta", "Godavari Sandesh",
        "Vidarbha Janmat", "Marathwada Darpan", "Deccan Tarun",
        "Maharashtra Jyoti", "Mumbai Dainik", "Pune Patrika",
        "Nashik Sandhya", "Nagpur Samvad", "Solapur Lokmat"
    ]
    with patch("agents.generator.generator.call_llm", return_value=json.dumps(mock_titles)):
        sample_brief = {
            "scope": "regional daily news",
            "region": "Maharashtra",
            "language": "Marathi",
            "audience": "general public",
        }
        candidates = generate_candidates(sample_brief, [], n=18)
        assert isinstance(candidates, list)
        assert len(candidates) >= 10
        assert "Sahyadri Prabhat" in candidates


def test_generate_candidates_fallback_line_parsing():
    raw_lines = (
        "1. Sahyadri Prabhat\n"
        "2. Konkan Varta\n"
        "3. Godavari Sandesh\n"
        "4. Vidarbha Janmat\n"
        "5. Marathwada Darpan\n"
        "6. Deccan Tarun\n"
        "7. Maharashtra Jyoti\n"
        "8. Mumbai Dainik\n"
        "9. Pune Patrika\n"
        "10. Nashik Sandhya\n"
        "11. Nagpur Samvad"
    )
    with patch("agents.generator.generator.call_llm", return_value=raw_lines):
        sample_brief = {"region": "Maharashtra"}
        candidates = generate_candidates(sample_brief, [], n=18)
        assert isinstance(candidates, list)
        assert len(candidates) >= 10

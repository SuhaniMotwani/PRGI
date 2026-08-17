"""Tests for agents.ranker."""

from agents.ranker.ranker import rank_candidates
from agents.local_contracts import SuggestedAlternative


def test_rank_candidates():
    sample_passed = [
        {"title": "Title A", "score": 75.0, "reasoning": "Clean"},
        {"title": "Title B", "score": 95.0, "reasoning": "High uniqueness"},
        {"title": "Title C", "score": 88.0, "reasoning": "Very good"},
        {"title": "Title D", "score": 60.0, "reasoning": "Acceptable"},
        {"title": "Title E", "score": 92.0, "reasoning": "Strong root"},
        {"title": "Title F", "score": 85.0, "reasoning": "Distinctive"},
        {"title": "Title G", "score": 70.0, "reasoning": "Moderate uniqueness"},
        {"title": "Title H", "score": 99.0, "reasoning": "Perfect score"},
    ]

    result = rank_candidates(sample_passed, top_k=5)
    assert len(result) == 5
    scores = [r["confidenceScore"] for r in result]
    assert scores == [99.0, 95.0, 92.0, 88.0, 85.0]

    for item in result:
        model_obj = SuggestedAlternative(**item)
        assert model_obj.verdict == "APPROVED"
        assert model_obj.confidenceScore >= 85.0

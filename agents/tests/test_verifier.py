import pytest
from agents.verifier.verifier import verify_candidates


def test_clashing_title_is_rejected():
    passed, rejected = verify_candidates(["Vidarbha Patrika News"])
    assert len(rejected) == 1
    assert rejected[0]["reason"]


def test_clean_title_passes():
    passed, rejected = verify_candidates(["Konkan Sunrise Weekly Digest"])
    for c in passed:
        assert "score" in c and "reasoning" in c

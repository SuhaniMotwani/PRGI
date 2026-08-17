"""Ranker agent implementation."""


def rank_candidates(passed: list[dict], top_k: int = 5) -> list[dict]:
    ranked = sorted(passed, key=lambda c: (-c["score"], len(c["title"])))
    return [
        {
            "title": c["title"],
            "confidenceScore": c["score"],
            "verdict": "APPROVED",
            "reasoning": f"Verified clean ({c['score']:.0f}% confidence): {c['reasoning']}",
        }
        for c in ranked[:top_k]
    ]

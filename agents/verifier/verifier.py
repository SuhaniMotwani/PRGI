from .mock_verify import mock_verify_title  # Day-2 swap point: replace with
                                              # an httpx call to backend's
                                              # real /v1/verify-title,
                                              # returning the same
                                              # VerifyTitleResponse shape
                                              # from agents.local_contracts.


def verify_candidates(candidates: list[str]) -> tuple[list[dict], list[dict]]:
    passed, rejected = [], []
    for title in candidates:
        result = mock_verify_title(title)
        if result.verdict == "APPROVED":
            passed.append({"title": title, "score": result.confidenceScore, "reasoning": result.reasonSummary})
        else:
            reasons = [v.message for v in result.ruleViolations if v.message]
            if result.clashingTitles:
                reasons.append(f"Clashes with '{result.clashingTitles[0].title}' ({result.clashingTitles[0].similarityScore}% similar).")
            rejected.append({"title": title, "reason": "; ".join(reasons) or result.reasonSummary})
    return passed, rejected

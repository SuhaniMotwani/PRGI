"""Mock verification implementation for offline testing and agent workflow."""

from datetime import datetime, timezone
import random
from agents.local_contracts import (
    VerificationResult,
    ClashingTitle,
    RuleViolation,
    SimilarityBreakdown,
)

FAKE_DB = [
    {"title": "Vidarbha Patrika", "language": "Marathi", "state": "Maharashtra", "regNo": "MAHMAR/2010/12345"},
    {"title": "Dainik Jagran", "language": "Hindi", "state": "Uttar Pradesh", "regNo": "UPHIN/1998/54321"},
    {"title": "Daily News", "language": "English", "state": "Delhi", "regNo": "DELENG/2005/67890"},
    {"title": "Maharashtra Times", "language": "Marathi", "state": "Maharashtra", "regNo": "MAHMAR/2001/11223"},
    {"title": "Lokmat", "language": "Marathi", "state": "Maharashtra", "regNo": "MAHMAR/1985/99887"},
]

BANNED_SUFFIXES = {"samachar", "times", "news", "daily", "express", "khabar", "bulletin"}
BANNED_WORDS = {"police", "crime", "corruption", "cbi", "cid", "army"}


def mock_verify_title(title: str) -> VerificationResult:
    words = [w.strip(".,!-:;\"'") for w in title.lower().split() if w.strip(".,!-:;'")]
    clash_entry = next((r for r in FAKE_DB if any(w in r["title"].lower().split() for w in words)), None)

    rule_violations = []
    if any(w in BANNED_WORDS for w in words):
        msg = "Title contains a disallowed official/institutional word."
        rule_violations.append(
            RuleViolation(
                ruleId="MOCK-R-DISALLOWED-01",
                ruleCode="MOCK-R-DISALLOWED-01",
                ruleName="Disallowed institutional/official words",
                severity="CRITICAL",
                description=msg,
                message=msg,
                clause="[MOCK / PENDING VERIFICATION - Real PRGI Guidelines citation to be verified]",
                passed=False,
                citationVerified=False,
            )
        )
    if words and words[-1] in BANNED_SUFFIXES:
        msg = f"'{words[-1]}' is a common filler suffix that requires distinct core words."
        rule_violations.append(
            RuleViolation(
                ruleId="MOCK-R-FILLER-02",
                ruleCode="MOCK-R-FILLER-02",
                ruleName="Generic filler suffix restriction",
                severity="MODERATE",
                description=msg,
                message=msg,
                clause="[MOCK / PENDING VERIFICATION - Real PRGI Guidelines citation to be verified]",
                passed=False,
                citationVerified=False,
            )
        )

    now_iso = datetime.now(timezone.utc).isoformat()

    if clash_entry or rule_violations:
        score = 82.0 if clash_entry else 55.0
        verdict = "REJECTED"
        clashing = (
            [
                ClashingTitle(
                    title=clash_entry["title"],
                    regNo=clash_entry.get("regNo"),
                    language=clash_entry.get("language"),
                    state=clash_entry.get("state"),
                    similarity=82.0,
                    similarityScore=82.0,
                    matchType="LEXICAL",
                    reason=f"Shares core token with registered title '{clash_entry['title']}'.",
                )
            ]
            if clash_entry
            else []
        )
        reason = (
            f"Clashes with registered title '{clash_entry['title']}'."
            if clash_entry
            else "Contains restricted words or common filler suffixes."
        )
        breakdown = SimilarityBreakdown(
            lexicalScore=score,
            phoneticScore=score * 0.8,
            semanticScore=score * 0.7,
            coreWordScore=score * 0.9,
            blendedScore=score,
        )
    else:
        score = float(random.randint(5, 25))
        verdict = "APPROVED"
        clashing = []
        reason = "Distinctive and compliant with checked guidelines; no registered conflicts found."
        breakdown = SimilarityBreakdown(
            lexicalScore=score,
            phoneticScore=score * 0.7,
            semanticScore=score * 0.6,
            coreWordScore=score * 0.5,
            blendedScore=score,
        )

    return VerificationResult(
        inputTitle=title,
        normalizedTitle=title.lower(),
        verdict=verdict,
        verdictScore=score,
        confidenceScore=100.0 - score,
        similarityBreakdown=breakdown,
        clashingTitles=clashing,
        ruleViolations=rule_violations,
        explanation=reason,
        reasonSummary=reason,
        timestamp=now_iso,
        guidelineCitations=["[MOCK / PENDING VERIFICATION - General Admissibility Clause 1.0]"],
    )

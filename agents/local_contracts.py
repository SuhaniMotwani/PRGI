# LOCAL MIRROR — NOT the source of truth. The real contract is
# contracts/contracts.py (owned by Divvye). This file exists so agents/ never
# has a hard import dependency on a file outside our ownership that may be
# mid-edit. Reconcile this manually against contracts/contracts.py and
# contracts/fixtures/ periodically — do not import contracts.contracts here.

"""Local Pydantic contract models for the agents package.

Derived from contracts/fixtures/*.json and aligned with AGENTS.md hard rules:
- camelCase JSON serialization via alias_generator=to_camel + populate_by_name=True
- Verdicts strictly Literal["APPROVED", "MANUAL_REVIEW", "REJECTED"]
- All similarity/confidence scores are float 0-100 (never 0-1)
- All timestamps in ISO 8601 UTC
"""

from __future__ import annotations

from typing import Any, Dict, List, Literal, Optional
from pydantic import BaseModel, ConfigDict, Field
from pydantic.alias_generators import to_camel


class BaseContractModel(BaseModel):
    """Base model applying camelCase aliases and population by name."""
    model_config = ConfigDict(
        alias_generator=to_camel,
        populate_by_name=True,
        extra="ignore",
    )


# --- Enums / Literal Types ---
VerdictType = Literal["APPROVED", "MANUAL_REVIEW", "REJECTED"]
OfficerStatusType = Literal["PENDING", "UNDER_REVIEW", "APPROVED", "REJECTED"]


# --- Fixture Models ---

class GeneratedCandidate(BaseContractModel):
    """Generated title candidate matching contracts/fixtures/alternatives.json and agent ranker."""
    id: Optional[str] = None
    title: str
    meaning: Optional[str] = None
    uniquenessScore: Optional[float] = Field(None, ge=0.0, le=100.0)
    confidenceScore: Optional[float] = Field(None, ge=0.0, le=100.0)
    verdict: Literal["APPROVED"] = "APPROVED"
    verificationPassed: bool = True
    riskScore: float = Field(0.0, ge=0.0, le=100.0)
    category: Optional[str] = None
    rationale: Optional[str] = None
    reasoning: Optional[str] = None

    def model_post_init(self, __context: Any) -> None:
        if self.confidenceScore is not None and self.uniquenessScore is None:
            self.uniquenessScore = self.confidenceScore
        elif self.uniquenessScore is not None and self.confidenceScore is None:
            self.confidenceScore = self.uniquenessScore
        if self.reasoning and not self.rationale:
            self.rationale = self.reasoning
        elif self.rationale and not self.reasoning:
            self.reasoning = self.rationale


# Alias for backward-compatible agent usage
SuggestedAlternative = GeneratedCandidate



class Candidate(BaseContractModel):
    """Registered title candidate matching contracts/fixtures/candidates_200.json."""
    titleId: Optional[int] = None
    title: str
    regNo: Optional[str] = None
    language: Optional[str] = None
    state: Optional[str] = None
    rawScore: float = 0.0
    source: Optional[str] = None


class OfficerCase(BaseContractModel):
    """Officer case model matching contracts/fixtures/officer_cases.json."""
    id: str
    applicantName: str
    proposedTitle: str
    language: str
    state: str
    periodicity: str
    submissionDate: str
    riskScore: float = Field(..., ge=0.0, le=100.0)
    verdict: VerdictType
    status: OfficerStatusType = "PENDING"
    primaryConflict: Optional[str] = None
    copilotDecisionNote: Optional[str] = None


class SimilarityBreakdown(BaseContractModel):
    """4-dimensional similarity scores (0-100 float)."""
    lexicalScore: float = Field(0.0, ge=0.0, le=100.0)
    phoneticScore: float = Field(0.0, ge=0.0, le=100.0)
    semanticScore: float = Field(0.0, ge=0.0, le=100.0)
    coreWordScore: float = Field(0.0, ge=0.0, le=100.0)
    blendedScore: float = Field(0.0, ge=0.0, le=100.0)


class ClashingTitle(BaseContractModel):
    """Conflicting registered title in verification result."""
    title: str
    regNo: Optional[str] = None
    language: Optional[str] = None
    state: Optional[str] = None
    similarity: float = Field(0.0, ge=0.0, le=100.0)
    similarityScore: Optional[float] = Field(None, ge=0.0, le=100.0)  # alias support
    matchType: Optional[str] = None
    matchedCoreWord: Optional[str] = None
    reason: Optional[str] = None

    def model_post_init(self, __context: Any) -> None:
        # Reconcile similarity vs similarityScore
        if self.similarityScore is not None and self.similarity == 0.0:
            self.similarity = self.similarityScore
        elif self.similarity is not None and self.similarityScore is None:
            self.similarityScore = self.similarity


class RuleViolation(BaseContractModel):
    """PRGI rule violation record."""
    ruleId: Optional[str] = None
    ruleCode: Optional[str] = None
    ruleName: Optional[str] = None
    severity: Optional[str] = "CRITICAL"
    description: Optional[str] = None
    message: Optional[str] = None
    clause: Optional[str] = None
    passed: bool = False
    triggerPhrase: Optional[str] = None
    requiresHumanConfirmation: bool = False
    citationVerified: bool = False

    def model_post_init(self, __context: Any) -> None:
        if self.ruleCode and not self.ruleId:
            self.ruleId = self.ruleCode
        elif self.ruleId and not self.ruleCode:
            self.ruleCode = self.ruleId
        if self.message and not self.description:
            self.description = self.message
        elif self.description and not self.message:
            self.message = self.description


class StageTimings(BaseContractModel):
    """Pipeline stage execution times in milliseconds."""
    normalize: float = 0.0
    shortlist: float = 0.0
    score: float = 0.0
    check: float = 0.0
    explain: float = 0.0


class VerificationResult(BaseContractModel):
    """Full verification response matching contracts/fixtures/verify_*.json."""
    inputTitle: str
    normalizedTitle: Optional[str] = None
    detectedLanguage: Optional[str] = None
    transliteratedTitle: Optional[str] = None
    coreWords: List[str] = Field(default_factory=list)
    verdict: VerdictType
    verdictScore: float = Field(0.0, ge=0.0, le=100.0)
    confidenceScore: Optional[float] = Field(None, ge=0.0, le=100.0)
    similarityBreakdown: Optional[SimilarityBreakdown] = None
    clashingTitles: List[ClashingTitle] = Field(default_factory=list)
    ruleViolations: List[RuleViolation] = Field(default_factory=list)
    explanation: Optional[str] = None
    reasonSummary: Optional[str] = None
    recommendedAction: Optional[str] = None
    guidelineCitations: List[str] = Field(default_factory=list)
    stageTimings: Optional[StageTimings] = None
    engine: str = "LIVE"
    cached: bool = False
    processingTimeMs: Optional[int] = None
    timestamp: str  # ISO 8601 UTC
    suggestedAlternatives: List[GeneratedCandidate] = Field(default_factory=list)

    def model_post_init(self, __context: Any) -> None:
        if self.confidenceScore is not None and self.verdictScore == 0.0:
            self.verdictScore = self.confidenceScore
        elif self.verdictScore is not None and self.confidenceScore is None:
            self.confidenceScore = self.verdictScore
        if self.reasonSummary and not self.explanation:
            self.explanation = self.reasonSummary
        elif self.explanation and not self.reasonSummary:
            self.reasonSummary = self.explanation


# Alias for verification response
VerifyTitleResponse = VerificationResult


# --- Agent Generation Request / Response Models ---

class GenerateTitlesRequest(BaseContractModel):
    """Request payload for Title Studio alternative title generation."""
    rejectedTitle: Optional[str] = None
    rejectionReason: Optional[str] = None
    scope: str = "national"
    region: str = "All India"
    language: str = "English"
    periodicity: Optional[str] = "Daily"
    category: Optional[str] = None
    audience: Optional[str] = "General public"
    keywords: List[str] = Field(default_factory=list)
    numSuggestions: int = 5


class GenerateTitlesResponse(BaseContractModel):
    """Response containing generated approved alternatives."""
    suggestedAlternatives: List[GeneratedCandidate] = Field(default_factory=list)
    generationNotes: Optional[str] = None
    timestamp: Optional[str] = None


class VerifyTitleRequest(BaseContractModel):
    """Request payload for title verification."""
    title: str
    language: Optional[str] = None
    state: Optional[str] = None
    periodicity: Optional[str] = None


# Structured error model as required by AGENTS.md
class ErrorDetail(BaseContractModel):
    code: str
    message: str


class ErrorResponse(BaseContractModel):
    error: ErrorDetail


# Rebuild models with forward refs if needed
VerificationResult.model_rebuild()
VerifyTitleResponse.model_rebuild()
GenerateTitlesResponse.model_rebuild()

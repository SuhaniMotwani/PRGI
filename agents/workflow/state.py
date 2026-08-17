from typing import TypedDict, List, Dict, Optional


class AgentState(TypedDict):
    brief: Optional[Dict]
    candidates: List[str]
    passed: List[Dict]
    rejected_log: List[Dict]
    attempt: int
    max_attempts: int
    final_ranked: List[Dict]

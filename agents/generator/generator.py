import json
from .prompts import GENERATOR_SYSTEM_PROMPT
from ..llm_client import call_llm


def generate_candidates(brief: dict, rejected_log: list[dict], n: int = 18) -> list[str]:
    rejected_text = "\n".join(f"- {r['title']} -> {r['reason']}" for r in rejected_log) or "(none yet)"
    prompt = GENERATOR_SYSTEM_PROMPT.format(n=n, brief=brief, rejected_log=rejected_text)
    raw = call_llm(prompt)
    try:
        candidates = json.loads(raw)
        assert isinstance(candidates, list)
        return [str(c).strip() for c in candidates if c]
    except Exception:
        return [line.strip("-• ").strip() for line in raw.splitlines() if line.strip()][:n]

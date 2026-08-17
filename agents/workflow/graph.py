from langgraph.graph import StateGraph, END
from .state import AgentState
from ..generator.generator import generate_candidates
from ..verifier.verifier import verify_candidates
from ..ranker.ranker import rank_candidates


def generate_node(state: AgentState) -> AgentState:
    candidates = generate_candidates(state["brief"], state["rejected_log"])
    return {**state, "candidates": candidates, "attempt": state["attempt"] + 1}


def verify_node(state: AgentState) -> AgentState:
    passed, rejected = verify_candidates(state["candidates"])
    return {**state, "passed": state["passed"] + passed, "rejected_log": state["rejected_log"] + rejected}


def should_continue(state: AgentState) -> str:
    if len(state["passed"]) >= 5 or state["attempt"] >= state["max_attempts"]:
        return "rank"
    return "generate"


def rank_node(state: AgentState) -> AgentState:
    return {**state, "final_ranked": rank_candidates(state["passed"])}


def build_graph():
    g = StateGraph(AgentState)
    g.add_node("generate", generate_node)
    g.add_node("verify", verify_node)
    g.add_node("rank", rank_node)
    g.set_entry_point("generate")
    g.add_edge("generate", "verify")
    g.add_conditional_edges("verify", should_continue, {"generate": "generate", "rank": "rank"})
    g.add_edge("rank", END)
    return g.compile()

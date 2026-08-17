from .interviewer import run_interview
from .graph import build_graph


def main():
    brief = run_interview()
    graph = build_graph()
    initial_state = {
        "brief": brief,
        "candidates": [],
        "passed": [],
        "rejected_log": [],
        "attempt": 0,
        "max_attempts": 4,
        "final_ranked": [],
    }
    result = graph.invoke(initial_state)
    print("\nTop suggestions:")
    for i, c in enumerate(result["final_ranked"], 1):
        print(f"{i}. {c['title']}  — {c['reasoning']}")


if __name__ == "__main__":
    main()

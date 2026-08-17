from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from .local_contracts import GenerateTitlesRequest, GenerateTitlesResponse, SuggestedAlternative
from .workflow.graph import build_graph

app = FastAPI(title="PRGI TitleGuard Agent Service", version="1.0.0")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])


@app.exception_handler(Exception)
async def structured_error_handler(request: Request, exc: Exception):
    return JSONResponse(status_code=500, content={"error": {"code": "INTERNAL_ERROR", "message": str(exc)}})


@app.get("/v1/agents/health")
def health():
    return {"status": "ok"}


@app.post("/v1/agents/generate-titles", response_model=GenerateTitlesResponse)
def generate_titles(brief: GenerateTitlesRequest):
    graph = build_graph()
    initial_state = {
        "brief": brief.model_dump(by_alias=False),
        "candidates": [],
        "passed": [],
        "rejected_log": [],
        "attempt": 0,
        "max_attempts": 4,
        "final_ranked": [],
    }
    result = graph.invoke(initial_state)
    return GenerateTitlesResponse(
        suggestedAlternatives=[SuggestedAlternative(**c) for c in result["final_ranked"]]
    )

# app/main.py

import os
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.auto_scoring.embedding_model import load_embedding_model
from app.auto_scoring.router import router as scoring_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    # ── STARTUP ──────────────────────────────────────────────────────
    # This runs before the server accepts any requests.
    # load_use_model() blocks until the model is in memory (~3–5s).
    # After this line, get_use_model() in pipeline.py will never return None.
    print("Loading embedding model...")
    load_embedding_model()
    print("Embedding model ready.")

    yield  # ← server is live here, handling requests

    # ── SHUTDOWN ─────────────────────────────────────────────────────
    # Nothing to clean up for the model — Python GC handles it.
    # Add DB connection pool teardown here if you add one later.


app = FastAPI(
    title="wq-auto-scoring-worker",
    version="0.1.0",
    lifespan=lifespan,
)

_default_cors_origins = "http://localhost:5173,http://127.0.0.1:5173,http://localhost:4173,http://127.0.0.1:4173"
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        origin.strip()
        for origin in os.getenv("CORS_ALLOW_ORIGINS", _default_cors_origins).split(",")
        if origin.strip()
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
)

# Mount the scoring router.
# All endpoints in router.py are now reachable at /auto-score/...
app.include_router(scoring_router, prefix="/auto-score")
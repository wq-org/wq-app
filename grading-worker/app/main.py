# app/main.py

from contextlib import asynccontextmanager
from fastapi import FastAPI
from app.grading.embedding_model import load_embedding_model
from app.grading.router import router as grading_router


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
    title="wq-grading-worker",
    version="0.1.0",
    lifespan=lifespan,
)

# Mount the grading router.
# All endpoints in router.py are now reachable at /grade/...
app.include_router(grading_router, prefix="/grade")
# wq-grading-worker

Standalone FastAPI service that grades open-ended student answers against a teacher reference solution. It combines four statistical NLP signals with one semantic embedding score (Universal Sentence Encoder), then applies the piecewise scoring equations from the short-answer grading paper (PMC12171532).

No PDF parsing, no database writes, no LLM calls — only deterministic math plus a single frozen TensorFlow Hub model loaded once at startup.

---

## Request flow (technical)

```
main.py
  │  at startup: calls load_use_model()
  │  mounts router (prefix /grade)
  ▼
router.py
  │  receives POST /grade body → GradeRequest
  │  calls run_grading_pipeline()
  ▼
pipeline.py
  │  runs all 11 functions in order
  │  calls get_use_model() inside compute_semantic()
  ▼
use_model.py
     returns the already-loaded TF model object
```

### Step-by-step

1. **`main.py`** — Creates the FastAPI app and registers a **lifespan** handler. On startup it calls `load_use_model()` so the USE encoder is in memory before any request arrives. It mounts `router` under `/grade` (so grading lives at `POST /grade/` and liveness at `GET /grade/health`).

2. **`router.py`** — HTTP boundary only. Validates the JSON body into `GradeRequest` (Pydantic). Calls `run_grading_pipeline()` with `student_answer`, `teacher_solution`, and `total_points`. Maps the returned dict to `GradeResponse`. On unexpected errors, returns `500` without leaking internals.

3. **`pipeline.py`** — Pure grading logic. Preprocesses text, computes four statistical metrics, one semantic metric, then equations (a)–(d). Only `compute_semantic()` touches TensorFlow.

4. **`use_model.py`** — Singleton loader. `load_use_model()` sets module-level `_use_model` via `hub.load(USE_MODEL_PATH)`. `get_use_model()` returns that object or raises if startup forgot to load.

---

## Pipeline: 11 functions (execution order)

`run_grading_pipeline()` calls these in sequence:

| #   | Function                        | Role                                                           |
| --- | ------------------------------- | -------------------------------------------------------------- |
| 1   | `tokenise_and_preprocess`       | Lowercase, tokenise, drop stopwords (×2: student + reference)  |
| 2   | `compute_jaccard`               | Keyword set overlap \(S_j\)                                    |
| 3   | `compute_edit_distance`         | Normalised Levenshtein \(S_e\) (inverted later as \(1/S_e\))   |
| 4   | `compute_cosine`                | TF-IDF cosine similarity \(S_c\)                               |
| 5   | `compute_normalized_word_count` | Length ratio \(S_w\)                                           |
| 6   | `compute_semantic`              | USE embeddings → cosine \(S\_{tf}\) (**only AI step**)         |
| 7   | `compute_base_score`            | Eq. (a): weighted \(C\_{nlp}\)                                 |
| 8   | `compute_confidence_score`      | Eq. (b): blend semantic + base → \(C\)                         |
| 9   | `compute_final_score`           | Eq. (c): branch `hard_zero` / `full_marks` / `partial` → \(F\) |
| 10  | `map_score_to_points`           | Eq. (d): \(M = \lceil \min(F \cdot T, T) \rceil\)              |
| 11  | `run_grading_pipeline`          | Orchestrator; returns dict matching `GradeResponse`            |

---

## Folder layout

```
grading-worker/                  # repo path (package name: wq-grading-worker)
├── app/
│   ├── main.py                  ← FastAPI app + lifespan USE model load
│   └── grading/
│       ├── constants.py         ← SCORING_WEIGHTS, THRESHOLDS, ATTENTION_BAND, MODEL_PATH
│       ├── schemas.py           ← GradeRequest, GradeResponse Pydantic models
│       ├── use_model.py         ← singleton loader, _use_model module-level var
│       ├── pipeline.py          ← 11 pure functions + run_grading_pipeline()
│       └── router.py            ← POST /grade, GET /health
├── tests/
│   └── grading/
│       └── test_pipeline.py     ← unit tests for all pure functions (planned)
├── Dockerfile                   ← production image (planned)
├── docker-compose.yml           ← local run + healthcheck (planned)
├── pyproject.toml               ← pinned deps, no PDF libs
├── requirements.txt             ← alternate install list (keep in sync with pyproject)
└── .env.example                 ← GRADING_WORKER_PORT, USE_MODEL_PATH (planned)
```

---

## What each file does

### `app/main.py`

- Instantiates `FastAPI(title="wq-grading-worker", lifespan=...)`.
- **Lifespan startup:** `load_use_model()` — loads Universal Sentence Encoder from `USE_MODEL_PATH` into process memory once.
- **Lifespan shutdown:** optional cleanup (drop reference to model).
- `app.include_router(router, prefix="/grade")` — exposes grading routes under `/grade`.

### `app/grading/constants.py`

- **`SCORING_WEIGHTS`** — Weights for Eq. (a) and semantic blend in Eq. (b) (`jaccard`, `edit_distance`, `cosine`, `normalized_word_count`, `semantic`).
- **`SCORING_THRESHOLDS`** — Branch cutoffs: semantic hard zero, full marks, word-count gate for full marks.
- **`TEACHER_ATTENTION_BAND`** — If confidence \(C\) falls in `[low, high]`, set `requires_teacher_attention` on the response.
- **`USE_MODEL_PATH`** — From env `USE_MODEL_PATH`; production must point to a **local directory** on disk (DSGVO: no runtime fetch from `tfhub.dev`).

### `app/grading/schemas.py`

- **`GradeRequest`** — `student_answer`, `teacher_solution`, `total_points` (validated); `institution_id` and `session_participant_id` for tenancy/logging/idempotency (not used inside the pipeline).
- **`GradeResponse`** — Six radar-axis floats, three composite scores, `marks_awarded`, `scoring_branch`, `requires_teacher_attention`.

### `app/grading/use_model.py`

- Module-level `_use_model: Optional[Any] = None`.
- **`load_use_model()`** — `hub.load(USE_MODEL_PATH)`; call only at startup.
- **`get_use_model()`** — Returns cached model; `RuntimeError` if not loaded.

### `app/grading/pipeline.py`

- All grading math; no FastAPI imports.
- NLTK stopwords/punkt downloaded on import (quiet).
- **`run_grading_pipeline(...)`** — Single entry for `router.py`; output keys match `GradeResponse`.

### `app/grading/router.py`

- **`POST /`** (mounted at `/grade` → **`POST /grade/`**) — Body: `GradeRequest` → `GradeResponse`.
- **`GET /health`** — `{"status": "ok"}` for Docker and uptime checks.

### `tests/grading/test_pipeline.py` (planned)

- Unit tests for each pure function with fixed inputs (no TensorFlow in most tests; mock `get_use_model` for `compute_semantic`).

### `Dockerfile` (planned)

- Multi-stage or slim Python image; install deps from `pyproject.toml`; copy `app/`; run `uvicorn app.main:app --host 0.0.0.0 --port ${GRADING_WORKER_PORT}`; bake or volume-mount USE model path.

### `docker-compose.yml` (planned)

- Service definition, port mapping, `USE_MODEL_PATH` volume, healthcheck hitting `GET /grade/health`.

### `pyproject.toml`

- Project metadata and **pinned** runtime deps: FastAPI, uvicorn, pydantic, tensorflow, tensorflow-hub, nltk, scikit-learn, numpy, pandas. Intentionally **no** PDF/document libraries.

### `.env.example` (planned)

| Variable              | Purpose                                           |
| --------------------- | ------------------------------------------------- |
| `GRADING_WORKER_PORT` | Port uvicorn listens on (e.g. `8081`)             |
| `USE_MODEL_PATH`      | Filesystem path to downloaded USE model directory |

---

## API (intended)

### `POST /grade/`

**Request**

```json
{
  "student_answer": "Photosynthesis converts light into chemical energy.",
  "teacher_solution": "Plants use sunlight to make glucose via photosynthesis.",
  "total_points": 10,
  "institution_id": "inst_abc",
  "session_participant_id": "sp_xyz"
}
```

**Response** — `GradeResponse` with scores, `marks_awarded`, `scoring_branch`, `requires_teacher_attention`.

### `GET /grade/health`

```json
{ "status": "ok" }
```

---

## Local development

```bash
cd grading-worker
python -m venv .venv && source .venv/bin/activate
pip install -e .   # or: pip install -r requirements.txt

export USE_MODEL_PATH=/path/to/local/use-model   # recommended for prod-like dev
uvicorn app.main:app --reload --port 8081
```

Wire `lifespan` in `main.py` before calling `/grade` in production — `compute_semantic()` requires `load_use_model()` to have run at startup.

---

## Design constraints

- **Singleton model** — One TF Hub load per process; never load inside a request handler.
- **Stateless grading** — Same inputs → same outputs; safe to scale horizontally if each replica loads its own model.
- **Privacy** — Ship USE weights on-server; set `USE_MODEL_PATH` to a local path in production.
- **Failure mode** — Router catches pipeline exceptions and returns generic `500`; log details server-side only.

---

## Notes

- **DSGVO:** `student_answer` and `teacher_solution` are in-memory only inside the worker. Never logged, never written to DB. Only `GradeResponse` floats are persisted.
- **USE model cold start:** Load eagerly in lifespan, not on first request. First inference after load is ~2–3 s; subsequent requests are fast.
- **Self-hosted model:** Download the USE artefact to Hetzner block storage. Set `USE_MODEL_PATH` env var to the local path. The container must start without internet access in production.
- **`scores_detail` JSONB:** The frontend writes `GradingRow` — validate the shape in `saveGradingResult()` before upsert. Do not trust raw client payload on the Supabase side.
- **Radar chart display:** `normalizedWordCount` may exceed `1.0`. Cap the axis to `1.0` for chart rendering; show the real raw value in the stats text block above the chart.

---

## Variables & usage

| Variable                                   | Location         | Usage                                                                               |
| ------------------------------------------ | ---------------- | ----------------------------------------------------------------------------------- |
| `SCORING_WEIGHTS`                          | `constants.py`   | Single source of truth for all 5 metric weights; never hardcode elsewhere.          |
| `SCORING_THRESHOLDS`                       | `constants.py`   | Hard-zero (`0.20`), full-mark (`0.90`), and word-count (`0.85`) thresholds.         |
| `TEACHER_ATTENTION_BAND`                   | `constants.py`   | Ambiguous band `[0.40, 0.70]`; triggers teacher review flag.                        |
| `USE_MODEL_PATH`                           | `constants.py`   | TFHub URL or local path (env `USE_MODEL_PATH`); swap to local for DSGVO compliance. |
| `_use_model`                               | `use_model.py`   | Module-level singleton loaded once at FastAPI startup and reused per request.       |
| `GradingResponse.normalizedWordCount`      | frontend types   | Radar chart axis value may exceed `1.0`; cap display at `1.0` in chart.             |
| `GradingResponse.requiresTeacherAttention` | `useGrading.ts`  | Derived boolean that drives teacher attention badge in dashboard.                   |
| `scores_detail`                            | Supabase `JSONB` | Stores full `GradingRow`; never store raw answer text (GDPR Art. 4(1)).             |

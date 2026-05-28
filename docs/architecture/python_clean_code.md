# Python Clean Code Principles for WQ

> WQ Motion Aware Learning · Python worker conventions · FastAPI style · Grading services · Supabase-aware infrastructure

This guide defines the Python conventions for WQ backend and worker code, especially `grading-worker/app/grading`. It adapts the most useful ideas from [Clean Code Python](https://github.com/zedr/clean-code-python#introduction) into a WQ-specific standard that stays coherent with the existing React 19, TypeScript, Supabase, PostgreSQL, and GDPR architecture.

## Scope

1. Use this guide for Python services, workers, background jobs, grading algorithms, FastAPI endpoints, CLI scripts, and infrastructure helpers.
2. Treat `grading-worker/app/grading` as the quality baseline: domain logic should remain explicit, typed, testable, and easy to trace.
3. Keep frontend and backend conventions aligned: thin boundaries, typed DTOs, domain-owned folders, public APIs through explicit modules, and zero hidden tenant assumptions.
4. Prefer boring, searchable, local-first code over clever abstraction.
5. Apply this guide together with Ruff, Black, Pyright or mypy, pytest, Docker Compose, Supabase RLS, and production logging.

## Core rule

Python code in WQ must optimize for traceability, testability, and tenant-safe correctness. A function should reveal what it does from its name, accept typed input, return typed output, avoid hidden side effects, and make security-sensitive decisions visible in one place.

```python
from dataclasses import dataclass


@dataclass(frozen=True, slots=True)
class GradingRequest:
    answer_text: str
    expected_terms: tuple[str, ...]
    max_score: int


@dataclass(frozen=True, slots=True)
class GradingResult:
    score: int
    matched_terms: tuple[str, ...]
    feedback_key: str


def grade_term_match(request: GradingRequest) -> GradingResult:
    matched_terms = tuple(
        term for term in request.expected_terms if term.lower() in request.answer_text.lower()
    )

    score = min(len(matched_terms), request.max_score)

    return GradingResult(
        score=score,
        matched_terms=matched_terms,
        feedback_key="grading.term_match.partial" if score else "grading.term_match.empty",
    )
```

## Alignment with WQ frontend conventions

1. **One responsibility per layer**: mirror the React rule of Component to Hook to API module by using Endpoint to Service to Domain to Repository or Client.
2. **DTO boundaries**: frontend `Row`, `Model`, and `FormValues` map to Python `RequestDTO`, `DomainModel`, and `ResponseDTO`.
3. **Explicit public surface**: frontend barrels map to Python package `__init__.py` files that export only stable public functions, classes, and DTOs.
4. **Naming by intent**: Python services use verbs like `grade_answer`, `normalize_terms`, `build_feedback`, and `validate_payload`.
5. **Security at the boundary**: never trust tenant, institution, role, or user fields from frontend payloads. Supabase RLS remains the enforcement layer.

### Security implication

The API layer may receive untrusted data, but tenant validation and persistence must not depend on client-provided tenant IDs. If the worker ever needs database access, use short-lived signed URLs, scoped service operations, and RLS-backed Supabase policies instead of broad service-role queries.

### Performance impact

Keeping pure grading logic in `domain/` reduces FastAPI import cost, enables fast unit tests without network calls, and makes it easier to run grading functions in parallel workers without loading storage or Supabase clients.

### UX recommendation

Expose stable response states to the frontend: `queued`, `processing`, `completed`, `failed`, and `needs_review`. The UI can then show skeleton loaders, optimistic status changes, and precise retry messages without guessing backend internals.

## Naming conventions

1. **Packages and modules**: use lowercase snake case: `grading_service.py`, `term_matcher.py`, `feedback_builder.py`.
2. **Classes**: use PascalCase nouns: `GradingRequest`, `RubricRule`, `SupabaseStorageClient`.
3. **Functions**: use verb-first snake case: `normalize_answer_text`, `calculate_score`, `build_feedback_items`.
4. **Booleans**: phrase as questions: `is_valid`, `has_required_terms`, `can_retry`, `should_publish_result`.
5. **Constants**: use uppercase searchable names: `MAX_FEEDBACK_ITEMS`, `DEFAULT_GRADING_TIMEOUT_SECONDS`.

```python
MAX_GRADING_TIMEOUT_SECONDS = 30


def should_retry_grading(error_code: str) -> bool:
    return error_code in {"timeout", "rate_limited", "transient_storage_error"}
```

## Variable rules

1. Use meaningful, pronounceable names. Prefer `normalized_answer` over `ans`, `txt`, or `val`.
2. Use the same vocabulary for the same concept. Do not mix `student`, `learner`, and `user` for the same entity in one module.
3. Use searchable names for domain constants. Avoid magic numbers in scoring and timeout logic.
4. Use explanatory variables when parsing complex regex, JSONB, or scoring conditions.
5. Avoid repeating context already provided by the class or module name.

```python
TERM_MATCH_THRESHOLD = 0.82


def has_confident_term_match(similarity_score: float) -> bool:
    return similarity_score >= TERM_MATCH_THRESHOLD
```

## Function rules

1. A function should do one thing: parse, normalize, score, validate, persist, or render feedback, not all at once.
2. Keep parameters to two or fewer where possible. Use dataclasses or Pydantic models for grouped data.
3. Avoid flag arguments like `include_feedback=True`. Split behavior into named functions.
4. Return values instead of mutating input unless mutation is the explicit purpose.
5. Raise domain-specific exceptions only at the boundary where they can be translated into API responses.

```python
from dataclasses import dataclass


@dataclass(frozen=True, slots=True)
class ScoreInput:
    normalized_answer: str
    expected_terms: tuple[str, ...]


def find_matched_terms(score_input: ScoreInput) -> tuple[str, ...]:
    return tuple(
        term
        for term in score_input.expected_terms
        if term.lower() in score_input.normalized_answer
    )


def calculate_term_score(matched_terms: tuple[str, ...], max_score: int) -> int:
    return min(len(matched_terms), max_score)
```

## Class and dataclass rules

1. Use classes when they own state, model a domain entity, or provide a stable protocol.
2. Prefer `@dataclass(frozen=True, slots=True)` for immutable domain objects.
3. Prefer Pydantic models for API request and response validation.
4. Avoid service classes unless they hold dependencies. Pure functions are better for deterministic grading logic.
5. Use `typing.Protocol` for infrastructure contracts when tests need fakes.

```python
from typing import Protocol


class ObjectStorageClient(Protocol):
    def create_signed_url(self, path: str, expires_in_seconds: int) -> str:
        ...


class GradingService:
    def __init__(self, storage_client: ObjectStorageClient) -> None:
        self._storage_client = storage_client
```

### Security implication

Protocols make it possible to test sensitive flows with fake clients without exposing real Supabase service keys or storage tokens in unit tests.

### Performance impact

Frozen slotted dataclasses reduce accidental mutation, reduce per-object memory overhead, and make large grading batches easier to reason about.

## DTO and validation conventions

1. API schemas live in `schemas/` and use Pydantic.
2. Domain models live in `domain/models.py` and should not import FastAPI, Supabase, or HTTP clients.
3. Convert request DTOs to domain models before grading starts.
4. Convert domain results to response DTOs at the API boundary.
5. Never pass raw JSONB dictionaries through multiple layers without typed validation.

```python
from pydantic import BaseModel, Field


class GradeAnswerRequestDTO(BaseModel):
    answer_text: str = Field(min_length=1, max_length=10_000)
    expected_terms: tuple[str, ...] = Field(min_length=1, max_length=100)
    max_score: int = Field(ge=0, le=100)


class GradeAnswerResponseDTO(BaseModel):
    score: int
    matched_terms: tuple[str, ...]
    feedback_key: str
```

### Security implication

Pydantic validation prevents oversized payloads, unexpected shapes, and accidental trust in frontend data. It does not replace RLS, tenant membership checks, content sanitization, or rate limiting.

### UX recommendation

Return validation errors with stable machine-readable codes and localized frontend keys, not raw Python exception messages.

## Error handling conventions

1. Define domain errors in `grading/errors.py`.
2. Translate domain errors to HTTP responses in the API layer only.
3. Log operational details server-side, but return safe, user-facing error codes to the frontend.
4. Do not catch broad `Exception` unless you re-raise after logging or convert it at the API boundary.
5. Avoid leaking patient, learner, institution, or answer content in error messages.

```python
class GradingError(Exception):
    error_code = "grading.error"


class UnsupportedQuestionTypeError(GradingError):
    error_code = "grading.unsupported_question_type"


def ensure_supported_question_type(question_type: str) -> None:
    if question_type not in {"term_match", "pin_mark", "line_select"}:
        raise UnsupportedQuestionTypeError(question_type)
```

### Security implication

Safe error translation helps meet GDPR Article 32 expectations for confidentiality and resilience by preventing logs and API responses from becoming secondary data leaks.

## Imports and public API

1. Use absolute imports inside the app package where practical: `from app.grading.domain.scoring import calculate_score`.
2. Use relative imports only for tightly coupled siblings in the same package.
3. Keep `__init__.py` explicit. Export only stable public names.
4. Do not import infrastructure modules from domain modules.
5. Avoid circular imports by moving shared types into `domain/models.py` or `schemas/`.

```python
# app/grading/__init__.py
from app.grading.services.grading_service import GradingService

__all__ = ["GradingService"]
```

## File and folder naming standard

1. **Domain packages**: singular domain names when they represent one bounded context, for example `grading`, `auth`, `courses`.
2. **Grouped utility folders**: plural names when they contain many same-kind modules, for example `schemas`, `services`, `clients`, `tests`.
3. **Route files**: suffix with `_routes.py`, for example `grading_routes.py`, when the file registers FastAPI routes.
4. **Service files**: suffix with `_service.py`, for example `grading_service.py`, when the file orchestrates a workflow.
5. **Test files**: prefix with `test_`, mirror the module under test, and keep unit and integration tests separated.

```text
app/grading/domain/scoring.py
app/grading/services/grading_service.py
app/grading/schemas/requests.py
app/grading/schemas/responses.py
app/tests/unit/grading/test_scoring.py
app/tests/integration/grading/test_grading_routes.py
```

## Infrastructure approach

### Configuration

1. Keep settings in `app/config/settings.py`.
2. Parse environment variables once at startup using Pydantic settings or an equivalent typed settings object.
3. Never read environment variables deep inside domain functions.
4. Separate local, staging, and production values through environment files and deployment secrets.
5. Validate required secrets at boot so misconfigured workers fail fast.

```python
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    supabase_url: str
    supabase_anon_key: str
    grading_timeout_seconds: int = 30
```

### Docker and runtime

1. Keep a dedicated `grading-worker/Dockerfile`.
2. Run the worker as a non-root user.
3. Use Docker Compose for local Supabase, worker, API, queue, and observability dependencies.
4. Pin Python and dependency versions.
5. Add a health endpoint and container health check.

### Supabase and PostgreSQL

1. Supabase remains the authorization and data enforcement boundary through RLS.
2. Python workers should stay stateless when possible and operate on signed URLs or API payloads.
3. If direct DB access becomes necessary, route through scoped service functions with strong audit logging.
4. Use PgBouncer for connection pooling when workers scale horizontally.
5. Test RLS policies with anon, authenticated, tenant member, teacher, admin, and service-role scenarios.

### Backups and resilience

1. Use automated PostgreSQL backups plus tested restore drills.
2. For production, plan point-in-time recovery with WAL archiving where operationally required.
3. Store worker artifacts in durable object storage with retention rules.
4. Make grading jobs idempotent so retries do not duplicate results.
5. Record audit events for publish, override, export, deletion, and privileged grading access.

### Security implication

This infrastructure approach supports GDPR Article 32 technical and organizational measures: access control, logging, encryption, resilience, backup restoration, and regular effectiveness testing.

## Logging and observability

1. Use structured JSON logs in production.
2. Include correlation IDs, job IDs, request IDs, and tenant-safe identifiers.
3. Do not log raw wound images, raw learner answers, patient data, signed URLs, JWTs, service keys, or full prompt payloads.
4. Emit metrics for latency, queue depth, grading success rate, validation failures, and retry count.
5. Add tracing around external calls, especially storage downloads and Supabase operations.

```python
logger.info(
    "grading_completed",
    extra={
        "job_id": job_id,
        "question_type": question_type,
        "duration_ms": duration_ms,
        "score": result.score,
    },
)
```

### Performance impact

Structured telemetry makes slow grading branches visible without adding noisy console output. It also supports targeted optimization instead of premature algorithm rewrites.

## Testing conventions

1. Unit-test domain functions without FastAPI, Supabase, network calls, or filesystem dependencies.
2. Integration-test route behavior, request validation, dependency wiring, and storage/client adapters.
3. Use fixtures for domain inputs and fake clients for infrastructure.
4. Add regression tests for every grading bug.
5. Include boundary tests for empty answers, oversized input, duplicate terms, multilingual text, and unsupported question types.

```python
def test_calculate_term_score_caps_at_max_score() -> None:
    matched_terms = ("infection", "granulation", "exudate")

    score = calculate_term_score(matched_terms=matched_terms, max_score=2)

    assert score == 2
```

## Type checking and formatting

1. Use Ruff for linting and import sorting.
2. Use Black formatting through Ruff format or Black directly.
3. Use Pyright or mypy for static type checks.
4. Use `from __future__ import annotations` when it improves typing ergonomics.
5. Treat type ignores as temporary and documented.

Recommended `pyproject.toml` baseline:

```toml
[tool.ruff]
line-length = 100
target-version = "py311"

[tool.ruff.lint]
select = ["E", "F", "I", "B", "UP", "SIM", "C4", "PL"]
ignore = ["PLR0913"]

[tool.pytest.ini_options]
testpaths = ["app/tests"]
python_files = ["test_*.py"]
```

### Performance impact

Static checks catch shape mismatches before runtime. This reduces failed grading jobs, shortens feedback loops, and keeps the frontend from receiving inconsistent response payloads.

## Algorithm conventions for grading

1. Keep normalization deterministic and separated from scoring.
2. Keep scoring functions pure and side-effect free.
3. Store rubric and algorithm version beside results when persistence is involved.
4. Prefer explicit thresholds and named constants over inline numeric values.
5. Make every non-obvious scoring decision explainable in feedback metadata.

```python
@dataclass(frozen=True, slots=True)
class AlgorithmVersion:
    name: str
    version: str


TERM_MATCH_ALGORITHM = AlgorithmVersion(name="term_match", version="1.0.0")
```

### UX recommendation

Return feedback keys and explainable metadata so the React UI can localize messages, show partial-credit explanations, and render teacher review states consistently.

## Supabase boundary conventions

1. Frontend API modules call Supabase directly only where RLS is designed for it.
2. Python workers should not bypass RLS unless there is a documented, audited service operation.
3. Signed URLs should be short-lived and scoped to the required object.
4. Never expose `SERVICE_ROLE_KEY` to browser code or build artifacts.
5. Keep all tenant and role enforcement testable with policy tests and integration tests.

### Security implication

Supabase service keys bypass RLS. Any Python code using elevated credentials must be treated as privileged infrastructure and must log purpose, actor, tenant, and job context without logging sensitive content.

## WQ pull request checklist for Python changes

1. Does every new module have one reason to change?
2. Are request DTOs, domain models, and response DTOs separated?
3. Are domain functions unit-tested without network dependencies?
4. Are tenant, role, secret, and signed URL risks handled explicitly?
5. Are performance and UX states visible to the frontend?

## Anti-patterns to avoid

1. **God service**: one file that validates, downloads, scores, persists, logs, and formats responses.
2. **Dictionary tunneling**: passing raw nested dicts across layers without typed schemas.
3. **Hidden I/O**: domain functions that secretly call Supabase, storage, HTTP, or environment variables.
4. **Boolean mode flags**: functions with `dry_run`, `include_feedback`, or `is_teacher_mode` flags that change behavior dramatically.
5. **Leaky errors**: returning Python tracebacks, signed URLs, raw learner answers, or tenant internals to the frontend.

## Default decision rules

1. If logic is pure and domain-specific, put it in `app/grading/domain/`.
2. If logic orchestrates a workflow, put it in `app/grading/services/`.
3. If logic talks to Supabase, storage, HTTP, queues, or logs, put it in `app/grading/infrastructure/`.
4. If logic validates API input or output, put it in `app/grading/schemas/`.
5. If logic is reused across Python workers but not domain-specific, move it to a shared package only after real reuse exists.

## Final standard

WQ Python code should feel like the backend counterpart of the frontend architecture: typed at boundaries, explicit in naming, layered by responsibility, secure by default, and optimized for a serious health education platform where grading correctness, auditability, tenant isolation, and learner feedback all matter.

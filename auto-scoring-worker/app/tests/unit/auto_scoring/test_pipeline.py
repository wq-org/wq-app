# app/tests/unit/auto_scoring_worker/test_pipeline.py
#
# Benchmark regression suite for the auto-scoring pipeline.
#
# All tests that touch run_grading_pipeline() mock compute_semantic() so tests
# run without loading the 400 MB embedding model.  Pure-function tests
# (compute_final_score, map_score_to_points, tokenise_and_preprocess) need no mock.
#
# Four benchmark cases validate the target mark bands on a 10-point scale:
#   Standardbeispiel           → 9–10 (near_full or full_marks)
#   Sehr nahe Übereinstimmung  → 9–10 (near_full)
#   Teilweise Übereinstimmung  → 7–8  (partial)
#   Schwache Übereinstimmung   → 4–6  (partial)
#
# One dummy case validates the pre-semantic short-circuit guard:
#   Nonsense answer            → 0    (hard_zero, no model call)

import pytest
from unittest.mock import patch

from app.auto_scoring.pipeline import (
    tokenise_and_preprocess,
    compute_final_score,
    map_score_to_points,
    run_grading_pipeline,
)

# ── Shared fixture ─────────────────────────────────────────────────────────────

TEACHER_SOLUTION = (
    "Die Wunde wird zunächst mit steriler Kochsalzlösung gespült und gereinigt. "
    "Anschließend wird ein feuchtes Wundmilieu mit einem geeigneten Verband aufrechterhalten, "
    "um die Granulation zu fördern und Infektionen zu vermeiden. "
    "Der Verband wird regelmäßig nach Herstellerangaben gewechselt."
)

TOTAL_POINTS = 10


# ── Pure-function tests ────────────────────────────────────────────────────────

def test_tokenise_removes_german_stopwords() -> None:
    tokens = tokenise_and_preprocess("die Wunde wird gereinigt")
    assert "die" not in tokens
    assert "wird" not in tokens
    assert "wunde" in tokens
    assert "gereinigt" in tokens


def test_tokenise_empty_string_returns_empty_list() -> None:
    assert tokenise_and_preprocess("") == []


def test_map_score_to_points_uses_round_not_ceil() -> None:
    # round(0.75 * 10) = round(7.5) = 8 — ties round to even in Python 3
    # The important property: no inflation beyond the actual fractional value
    assert map_score_to_points(0.84, 10) == 8
    assert map_score_to_points(0.45, 10) == 4  # not 5 (ceil would give 5)
    assert map_score_to_points(1.0, 10) == 10
    assert map_score_to_points(0.0, 10) == 0


def test_compute_final_score_hard_zero() -> None:
    score, branch = compute_final_score(
        confidence=0.50, semantic=0.15, word_count=0.80, jaccard=0.35, cosine=0.30
    )
    assert branch == "hard_zero"
    assert score == 0.0


def test_compute_final_score_full_marks() -> None:
    score, branch = compute_final_score(
        confidence=0.99, semantic=0.99, word_count=0.95, jaccard=0.50, cosine=0.40
    )
    assert branch == "full_marks"
    assert score == 1.0


def test_compute_final_score_near_full() -> None:
    score, branch = compute_final_score(
        confidence=0.90, semantic=0.95, word_count=0.87, jaccard=0.32, cosine=0.25
    )
    assert branch == "near_full"
    assert score == pytest.approx(0.92)


def test_compute_final_score_partial_applies_calibration() -> None:
    # confidence = 0.60 → calibrated = 0.40 + 0.60 * 0.55 = 0.73
    score, branch = compute_final_score(
        confidence=0.60, semantic=0.65, word_count=0.70, jaccard=0.20, cosine=0.20
    )
    assert branch == "partial"
    assert score == pytest.approx(0.40 + 0.60 * 0.55, abs=1e-6)


# ── Benchmark integration tests (embedding model mocked) ──────────────────────

def _run_with_mocked_semantic(student_answer: str, semantic_value: float) -> dict:
    with patch(
        "app.auto_scoring.pipeline.compute_semantic",
        return_value=semantic_value,
    ):
        return run_grading_pipeline(
            student_answer=student_answer,
            teacher_solution=TEACHER_SOLUTION,
            total_points=TOTAL_POINTS,
        )


# Benchmark 1 — Standardbeispiel (verbatim reference answer)
def test_benchmark_standardbeispiel_marks_9_to_10() -> None:
    result = _run_with_mocked_semantic(
        student_answer=TEACHER_SOLUTION,
        semantic_value=0.99,
    )
    assert 9 <= result["marks_awarded"] <= 10, (
        f"Standardbeispiel expected 9–10, got {result['marks_awarded']} "
        f"(branch={result['scoring_branch']}, final={result['final_score']:.3f})"
    )


# Benchmark 2 — Sehr nahe Übereinstimmung (close paraphrase, same clinical content)
def test_benchmark_sehr_nahe_marks_9_to_10() -> None:
    result = _run_with_mocked_semantic(
        student_answer=(
            "Zunächst reinige ich die Wunde mit physiologischer Kochsalzlösung. "
            "Dann lege ich einen feuchten Verband an, um die Wundheilung zu unterstützen "
            "und Infektionen zu verhindern. Der Verbandwechsel erfolgt regelmäßig."
        ),
        semantic_value=0.96,
    )
    assert 9 <= result["marks_awarded"] <= 10, (
        f"Sehr nahe Übereinstimmung expected 9–10, got {result['marks_awarded']} "
        f"(branch={result['scoring_branch']}, final={result['final_score']:.3f})"
    )


# Benchmark 3 — Teilweise Übereinstimmung (core idea only, missing detail)
def test_benchmark_teilweise_marks_7_to_8() -> None:
    result = _run_with_mocked_semantic(
        student_answer=(
            "Die Wunde wird gereinigt und verbunden. "
            "Man sollte auf Infektionen achten und den Verband wechseln."
        ),
        semantic_value=0.78,
    )
    assert 7 <= result["marks_awarded"] <= 8, (
        f"Teilweise Übereinstimmung expected 7–8, got {result['marks_awarded']} "
        f"(branch={result['scoring_branch']}, final={result['final_score']:.3f})"
    )


# Benchmark 4 — Schwache Übereinstimmung (medically adjacent but wrong procedure)
def test_benchmark_schwache_marks_4_to_6() -> None:
    result = _run_with_mocked_semantic(
        student_answer=(
            "Den Patienten beruhigen und einen Arzt rufen. "
            "Die Verletzung kühlen und hochlagern."
        ),
        semantic_value=0.42,
    )
    assert 4 <= result["marks_awarded"] <= 6, (
        f"Schwache Übereinstimmung expected 4–6, got {result['marks_awarded']} "
        f"(branch={result['scoring_branch']}, final={result['final_score']:.3f})"
    )


# Subtask 1 — Dummy / nonsense answer guard
def test_dummy_answer_returns_hard_zero_without_calling_model() -> None:
    dummy_cases = ["asdfgh", ".", "1234", "ich weiß nicht", "keine Ahnung"]
    for dummy in dummy_cases:
        with patch(
            "app.auto_scoring.pipeline.compute_semantic"
        ) as mock_semantic:
            result = run_grading_pipeline(
                student_answer=dummy,
                teacher_solution=TEACHER_SOLUTION,
                total_points=TOTAL_POINTS,
            )
            mock_semantic.assert_not_called(), (
                f"compute_semantic must not be called for dummy answer: {dummy!r}"
            )
            assert result["marks_awarded"] == 0, (
                f"Dummy answer {dummy!r} returned {result['marks_awarded']} marks, expected 0"
            )
            assert result["final_score"] == 0.0
            assert result["scoring_branch"] == "hard_zero"
            assert result["requires_teacher_attention"] is False

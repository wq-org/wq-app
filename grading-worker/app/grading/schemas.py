# wq-grading-worker/app/grading/schemas.py
from typing import Literal
from pydantic import BaseModel, Field


class GradeRequest(BaseModel):
    student_answer: str          = Field(min_length=1)
    teacher_solution: str        = Field(min_length=1)
    total_points: int            = Field(gt=0)
    institution_id: str          # tenant boundary — logged only, never persisted
    session_participant_id: str  # idempotency key


class GradeResponse(BaseModel):
    # ── 6 radar chart axes ──────────────────────────────────────────
    jaccard_score: float              # S_j  ∈ [0,1]
    inverted_edit_score: float        # 1/Se — already inverted, clamped to [0,1]
    cosine_score: float               # S_c  ∈ [0,1]
    normalized_word_count: float      # S_w  — may exceed 1.0, cap in chart display
    semantic_score: float             # S_tf ∈ [0,1]  ← only AI-produced value

    # ── Pipeline outputs ────────────────────────────────────────────
    base_score: float                 # C_nlp Eq.(a) ∈ [0,1]
    confidence_score: float           # C     Eq.(b) ∈ [0,1]
    final_score: float                # F     Eq.(c) ∈ [0,1]

    # ── Derived ─────────────────────────────────────────────────────
    marks_awarded: int
    total_points: int
    scoring_branch: Literal["hard_zero", "full_marks", "partial"]
    requires_teacher_attention: bool
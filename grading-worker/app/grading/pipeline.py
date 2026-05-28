# wq-grading-worker/app/grading/pipeline.py

def tokenise_and_preprocess(text: str) -> list[str]:
    """Lowercase → remove NLTK stopwords → return keyword list."""

def compute_jaccard(student_kw: list[str], reference_kw: list[str]) -> float:
    """S_j = |A ∩ B| / |A ∪ B|. Returns 0.0 when both sets empty."""

def compute_edit_distance(student: str, reference: str) -> float:
    """Se = nltk.edit_distance / max(len). Floor 1e-6. Returns Se ∈ (0,1]."""

def compute_cosine(student: str, reference: str) -> float:
    """TfidfVectorizer → cosine_similarity. Returns S_c ∈ [0,1]."""

def compute_normalized_word_count(student_kw: list[str], reference_kw: list[str]) -> float:
    """S_w = len(reference_kw) / len(student_kw). Floor 1e-6. May exceed 1.0."""

def compute_semantic(student: str, reference: str) -> float:
    """USE singleton encode → cosine of 512-dim vectors. Returns S_tf ∈ [0,1]."""

def compute_base_score(signals: dict) -> float:
    """Eq.(a): clamp(wj·Sj + we·(1/Se) + wc·Sc + ww·Sw, 0, 1)."""

def compute_confidence_score(base_score: float, semantic_score: float) -> float:
    """Eq.(b): clamp(0.5·Stf + 0.5·C_nlp, 0, 1)."""

def compute_final_score(
    confidence: float, semantic: float, word_count: float
) -> tuple[float, str]:
    """Eq.(c): returns (F, branch). branch ∈ {'hard_zero','full_marks','partial'}."""

def map_score_to_points(final_score: float, total_points: int) -> int:
    """Eq.(d): ceil(min(F·T, T)). Works for any T."""

def run_grading_pipeline(
    student_answer: str,
    teacher_solution: str,
    total_points: int,
) -> dict:
    """Orchestrator — single entry point. Returns dict matching GradeResponse fields."""
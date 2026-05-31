# app/auto_scoring/pipeline.py

import math
import numpy as np
import nltk
from nltk.corpus import stopwords
from nltk.metrics.distance import edit_distance
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from app.auto_scoring.constants import (
    SCORING_WEIGHTS,
    SCORING_THRESHOLDS,
    TEACHER_ATTENTION_BAND,
    MIN_MEANINGFUL_TOKENS,
)
from app.auto_scoring.embedding_model import get_embedding_model

# Download NLTK data once on import — safe to call multiple times
nltk.download("stopwords", quiet=True)
nltk.download("punkt", quiet=True)
nltk.download("punkt_tab", quiet=True)  # required by NLTK ≥ 3.9

_STOP_WORDS = set(stopwords.words("german"))


# ── Step 1: Preprocessing ─────────────────────────────────────────────────────

def tokenise_and_preprocess(text: str) -> list[str]:
    """
    Lowercase → split into tokens → remove stopwords.
    Returns a list of meaningful keyword strings.
    Called separately on student_answer and teacher_solution.
    """
    tokens = nltk.word_tokenize(text.lower())
    return [t for t in tokens if t.isalpha() and t not in _STOP_WORDS]


# ── Step 2: Four statistical NLP metrics ─────────────────────────────────────

def compute_jaccard(student_kw: list[str], reference_kw: list[str]) -> float:
    """
    S_j = |A ∩ B| / |A ∪ B|
    Measures keyword set overlap. Returns 0.0 if both sets are empty.
    Pure set math — no libraries needed.
    """
    a, b = set(student_kw), set(reference_kw)
    if not a and not b:
        return 0.0
    return len(a & b) / len(a | b)


def compute_edit_distance(student: str, reference: str) -> float:
    """
    Se = nltk.edit_distance(student, reference) / max(len(student), len(reference))
    Normalised to [0, 1]. Floored at 1e-6 — never zero (used as denominator).
    Lower Se = more character-level changes needed = worse match.
    The pipeline INVERTS this: 1/Se is used in Eq.(a).
    """
    raw = edit_distance(student, reference)
    max_len = max(len(student), len(reference))
    if max_len == 0:
        return 1e-6
    normalised = raw / max_len
    return max(normalised, 1e-6)


def compute_cosine(student: str, reference: str) -> float:
    """
    TF-IDF vectorise both strings → cosine_similarity of the two vectors.
    Catches synonym usage and paraphrasing — two vectors with similar
    word-frequency distributions score high even with different exact words.
    Returns S_c ∈ [0, 1].
    """
    vectorizer = TfidfVectorizer()
    try:
        tfidf = vectorizer.fit_transform([student, reference])
        return float(cosine_similarity(tfidf[0], tfidf[1])[0][0])
    except ValueError:
        # fit_transform fails on empty strings — return 0
        return 0.0


def compute_normalized_word_count(
    student_kw: list[str], reference_kw: list[str]
) -> float:
    """
    S_w = min(len(student_kw) / len(reference_kw), 1.0)
    Keyword coverage relative to the reference, capped at 1.0.
    Verbose answers beyond the reference length receive no extra credit.
    """
    ref_len = len(reference_kw)
    if len(student_kw) == 0:
        return 1e-6
    if ref_len == 0:
        return 1.0
    return min(len(student_kw) / ref_len, 1.0)


# ── Step 3: Semantic score via embedding model (the only AI step) ─────────────

def compute_semantic(student: str, reference: str) -> float:
    """
    Encodes both strings with the embedding model → dense vectors.
    Returns cosine similarity between those vectors → S_tf ∈ [0, 1].

    THIS IS THE ONLY FUNCTION THAT CALLS THE AI MODEL.
    get_embedding_model() returns the singleton loaded at startup.
    All other functions are pure statistics — no model involved.
    """
    model = get_embedding_model()
    # multilingual-e5-base requires an instruction prefix; "query:" is correct for
    # symmetric similarity tasks (grading is not asymmetric retrieval).
    embeddings = model.encode(
        [f"query: {student}", f"query: {reference}"],
        normalize_embeddings=True,
    )
    student_vec = embeddings[0]
    reference_vec = embeddings[1]

    # Vectors are already unit-length (normalize_embeddings=True), so cosine = dot product.
    return float(np.clip(np.dot(student_vec, reference_vec), 0.0, 1.0))


# ── Step 4: Equations (a), (b), (c), (d) ─────────────────────────────────────

def compute_base_score(
    jaccard: float,
    inverted_edit: float,   # caller passes 1/Se, not Se
    cosine: float,
    word_count: float,
) -> float:
    """Eq.(a): C_nlp = clamp(wj·Sj + we·(1/Se) + wc·Sc + ww·Sw, 0, 1)"""
    w = SCORING_WEIGHTS
    raw = (
        w["jaccard"]               * jaccard +
        w["edit_distance"]         * inverted_edit +
        w["cosine"]                * cosine +
        w["normalized_word_count"] * word_count
    )
    return float(np.clip(raw, 0.0, 1.0))


def compute_confidence_score(base_score: float, semantic_score: float) -> float:
    """Eq.(b): C = clamp(0.4·Stf + 0.6·C_nlp, 0, 1)"""
    w_tf = SCORING_WEIGHTS["semantic"]
    raw = w_tf * semantic_score + (1 - w_tf) * base_score
    return float(np.clip(raw, 0.0, 1.0))


def compute_final_score(
    confidence: float,
    semantic: float,
    word_count: float,
    jaccard: float,
    cosine: float,
) -> tuple[float, str]:
    """
    Eq.(c): four-branch piecewise decision.
    Returns (F, branch) — branch is one of:
      'hard_zero'  — semantic below minimum meaningful threshold
      'full_marks' — all four lexical + semantic gates pass
      'near_full'  — high semantic + most lexical gates pass; one gate narrowly missed
      'partial'    — everything else; confidence stretched across 0.40–0.95 band

    Branching order: hard_zero → full_marks → near_full → partial.
    Calibration remap for partial: 0.40 + confidence * 0.55
    This spreads [0, 1] confidence values across the 0.40–0.95 output range,
    producing four human-readable integer bands on a 10-point scale.
    """
    t = SCORING_THRESHOLDS

    if semantic < t["semantic_hard_zero"]:
        return 0.0, "hard_zero"

    if (
        semantic   >= t["semantic_full_mark"]
        and word_count >= t["word_count_full_mark"]
        and jaccard    >= t["full_marks_jaccard_min"]
        and cosine     >= t["full_marks_cosine_min"]
    ):
        return 1.0, "full_marks"

    if (
        semantic   >= t["near_full_semantic_min"]
        and word_count >= t["near_full_word_count_min"]
        and jaccard    >= t["near_full_jaccard_min"]
    ):
        return t["near_full_final_score"], "near_full"

    # Linear remap stretches partial confidence across a wider output range.
    calibrated = float(np.clip(0.40 + confidence * 0.55, 0.0, 1.0))
    return calibrated, "partial"


def map_score_to_points(final_score: float, total_points: int) -> int:
    """Eq.(d): M = round(min(F·T, T))"""
    return round(min(final_score * total_points, total_points))


# ── Step 5: Orchestrator ──────────────────────────────────────────────────────

def run_grading_pipeline(
    student_answer: str,
    teacher_solution: str,
    total_points: int,
) -> dict:
    """
    Single entry point. Calls every function above in order.
    Returns a dict matching GradeResponse field names exactly.
    router.py calls this — nothing else should.

    Short-circuits to hard_zero before the embedding model is called if the
    student answer yields fewer than MIN_MEANINGFUL_TOKENS content tokens
    after stopword removal. This prevents nonsense or empty answers from
    receiving a non-zero semantic score.
    """
    # Preprocess both sides first.
    student_kw   = tokenise_and_preprocess(student_answer)
    reference_kw = tokenise_and_preprocess(teacher_solution)

    # ── Dummy / nonsense guard ────────────────────────────────────────────────
    # Zero or near-zero content tokens mean the answer carries no meaningful
    # information; skip all metric computation including the embedding call.
    if len(student_kw) < MIN_MEANINGFUL_TOKENS:
        return {
            "jaccard_score":              0.0,
            "inverted_edit_score":        0.0,
            "cosine_score":               0.0,
            "normalized_word_count":      0.0,
            "semantic_score":             0.0,
            "base_score":                 0.0,
            "confidence_score":           0.0,
            "final_score":                0.0,
            "marks_awarded":              0,
            "total_points":               total_points,
            "scoring_branch":             "hard_zero",
            "requires_teacher_attention": False,
        }

    # Four statistical signals
    jaccard    = compute_jaccard(student_kw, reference_kw)
    se         = compute_edit_distance(student_answer, teacher_solution)
    inv_edit   = 1.0 / se                                   # inversion happens here
    cosine     = compute_cosine(student_answer, teacher_solution)
    word_count = compute_normalized_word_count(student_kw, reference_kw)

    # One AI signal — only reached when student answer has meaningful content
    semantic = compute_semantic(student_answer, teacher_solution)

    # Equations
    base       = compute_base_score(jaccard, inv_edit, cosine, word_count)
    confidence = compute_confidence_score(base, semantic)
    final, branch = compute_final_score(confidence, semantic, word_count, jaccard, cosine)
    marks      = map_score_to_points(final, total_points)

    # Teacher attention: ambiguous confidence band, semantic high but lexical low
    # (likely embedding false positive), or near_full award needing teacher confirmation.
    band = TEACHER_ATTENTION_BAND
    attention = (
        band["low"] <= confidence <= band["high"]
        or (semantic >= 0.75 and jaccard < 0.25)
        or branch == "near_full"
    )

    return {
        "jaccard_score":              jaccard,
        "inverted_edit_score":        float(np.clip(inv_edit, 0.0, 1.0)),
        "cosine_score":               cosine,
        "normalized_word_count":      word_count,
        "semantic_score":             semantic,
        "base_score":                 base,
        "confidence_score":           confidence,
        "final_score":                final,
        "marks_awarded":              marks,
        "total_points":               total_points,
        "scoring_branch":             branch,
        "requires_teacher_attention": attention,
    }

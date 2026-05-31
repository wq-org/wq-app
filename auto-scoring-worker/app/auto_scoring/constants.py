import os

SCORING_WEIGHTS: dict[str, float] = {
    "jaccard":               0.20,
    "edit_distance":         0.05,  # applied to 1/Se — already inverted before use
    "cosine":                0.20,
    "normalized_word_count": 0.15,
    "semantic":              0.40,  # reduced so lexical signals have more influence
}

SCORING_THRESHOLDS: dict[str, float] = {
    "semantic_hard_zero":       0.20,
    "semantic_full_mark":       0.98,  # raised: multilingual-e5-base scores broadly related answers high
    "word_count_full_mark":     0.90,
    "full_marks_jaccard_min":   0.40,  # lexical gate: full_marks requires keyword overlap
    "full_marks_cosine_min":    0.30,  # lexical gate: full_marks requires TF-IDF similarity
    # near_full branch: high semantic + most lexical coverage but one gate narrowly missed
    "near_full_semantic_min":   0.94,
    "near_full_word_count_min": 0.85,
    "near_full_jaccard_min":    0.30,
    "near_full_final_score":    0.92,  # maps to 9 marks via round() on 10-point scale
}

TEACHER_ATTENTION_BAND: dict[str, float] = {
    "low":  0.40,
    "high": 0.70,
}

# Minimum number of German content tokens (after stopword removal) required to
# proceed past the preprocessing guard. Answers below this threshold are
# short-circuited as hard_zero without calling the embedding model.
MIN_MEANINGFUL_TOKENS: int = 2

# Four-band calibration bounds — used in test assertions and documentation.
# Runtime calibration uses the linear remap: 0.40 + confidence * 0.55
BAND_FULL      = (0.95, 1.00)  # 10 marks on a 10-point scale
BAND_NEAR_FULL = (0.85, 0.94)  # 9 marks
BAND_PARTIAL   = (0.50, 0.84)  # 5–8 marks
BAND_WEAK      = (0.00, 0.49)  # 0–4 marks

# DSGVO: set EMBEDDING_MODEL_NAME to a local directory on Hetzner after downloading the artefact.
# Never let the worker resolve tfhub.dev at runtime in production.
EMBEDDING_MODEL_NAME: str = os.getenv(
    "EMBEDDING_MODEL_NAME",
    "embaas/sentence-transformers-multilingual-e5-base",  # dev fallback only
)

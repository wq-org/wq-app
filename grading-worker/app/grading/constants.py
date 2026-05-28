import os

SCORING_WEIGHTS: dict[str, float] = {
    "jaccard":               0.20,
    "edit_distance":         0.05,  # applied to 1/Se — already inverted before use
    "cosine":                0.20,
    "normalized_word_count": 0.15,
    "semantic":              0.40,  # reduced so lexical signals have more influence
}

SCORING_THRESHOLDS: dict[str, float] = {
    "semantic_hard_zero":     0.20,
    "semantic_full_mark":     0.98,  # raised: multilingual-e5-base scores broadly related answers high
    "word_count_full_mark":   0.90,
    "full_marks_jaccard_min": 0.40,  # lexical gate: full_marks requires keyword overlap
    "full_marks_cosine_min":  0.30,  # lexical gate: full_marks requires TF-IDF similarity
}

TEACHER_ATTENTION_BAND: dict[str, float] = {
    "low":  0.40,
    "high": 0.70,
}

# DSGVO: set EMBEDDING_MODEL_NAME to a local directory on Hetzner after downloading the artefact.
# Never let the worker resolve tfhub.dev at runtime in production.
EMBEDDING_MODEL_NAME: str = os.getenv(
    "EMBEDDING_MODEL_NAME",
    "embaas/sentence-transformers-multilingual-e5-base",  # dev fallback only
)

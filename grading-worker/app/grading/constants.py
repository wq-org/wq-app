import os

SCORING_WEIGHTS: dict[str, float] = {
    "jaccard":               0.15,
    "edit_distance":         0.05,  # applied to 1/Se — already inverted before use
    "cosine":                0.15,
    "normalized_word_count": 0.15,
    "semantic":              0.50,
}

SCORING_THRESHOLDS: dict[str, float] = {
    "semantic_hard_zero":    0.20,
    "semantic_full_mark":    0.90,
    "word_count_full_mark":  0.85,
}

TEACHER_ATTENTION_BAND: dict[str, float] = {
    "low":  0.40,
    "high": 0.70,
}

# DSGVO: set USE_MODEL_PATH to a local directory on Hetzner after downloading the artefact.
# Never let the worker resolve tfhub.dev at runtime in production.
USE_MODEL_PATH: str = os.getenv(
    "USE_MODEL_PATH",
    "https://tfhub.dev/google/universal-sentence-encoder/4",  # dev fallback only
)

# app/auto_scoring/embedding_model.py

from sentence_transformers import SentenceTransformer
from app.auto_scoring.constants import EMBEDDING_MODEL_NAME

_embedding_model: SentenceTransformer | None = None


def load_embedding_model() -> None:
    """
    Called ONCE at server startup via main.py lifespan.
    Loads the embedding model from EMBEDDING_MODEL_NAME into _embedding_model.
    Never call this inside an endpoint or pipeline function.
    """
    global _embedding_model
    _embedding_model = SentenceTransformer(EMBEDDING_MODEL_NAME)


def get_embedding_model() -> SentenceTransformer:
    """
    Called by pipeline.py → compute_semantic().
    Returns the already-loaded model.
    Raises RuntimeError if someone forgot to call load_embedding_model() first.
    """
    if _embedding_model is None:
        raise RuntimeError(
            "Embedding model is not loaded. Call load_embedding_model() at startup."
        )
    return _embedding_model

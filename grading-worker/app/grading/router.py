# app/grading/router.py

from fastapi import APIRouter, HTTPException
from app.grading.schemas import GradeRequest, GradeResponse
from app.grading.pipeline import run_grading_pipeline

router = APIRouter()


@router.post("/", response_model=GradeResponse)
def grade_answer(body: GradeRequest) -> GradeResponse:
    """
    POST /grade/
    Receives: student_answer, teacher_solution, total_points, institution_id, session_participant_id
    Returns: GradeResponse with all 7 floats + branch + marks + attention flag

    FastAPI automatically:
    - parses the JSON body into GradeRequest (Pydantic validates it)
    - serialises the return dict into GradeResponse JSON
    - returns 422 if body fails Pydantic validation
    """
    try:
        result = run_grading_pipeline(
            student_answer=body.student_answer,
            teacher_solution=body.teacher_solution,
            total_points=body.total_points,
        )
        return GradeResponse(**result)

    except Exception as e:
        # Never expose internal error details to the client.
        # Log the real error server-side.
        raise HTTPException(status_code=500, detail="Grading pipeline failed.")


@router.get("/health")
def health_check() -> dict:
    """
    GET /grade/health
    Used by Docker health checks and Hetzner uptime monitoring.
    Returns 200 immediately — if the server responds, it is alive.
    """
    return {"status": "ok"}
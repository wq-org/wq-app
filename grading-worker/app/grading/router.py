from fastapi import APIRouter


router = APIRouter(prefix="/api/v1/users", tags=["users"])


@router.get("/")
async def read_users():
    return [{"username": "Rick"}, {"username": "Morty"}] 
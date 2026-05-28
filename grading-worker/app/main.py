from fastapi import FastAPI
from app.grading.router import router as users_router

app = FastAPI()

app.include_router(users_router)

##app = FastAPI(title="wq-grading-worker", lifespan=lifespan)
## app.include_router(router, prefix="/grade")

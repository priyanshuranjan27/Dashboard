from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers.testing import router as testing_router
from routers.checking import router as jira_router

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

#---------just for testing the api-----------
@app.get("/api/hello")
def hello():
    return {
        "status": 200,
        "message": "Hello welcome to the backend"
    }
#---------------------------------------------------

app.include_router(testing_router,prefix="/api")
app.include_router(jira_router, prefix="/api")
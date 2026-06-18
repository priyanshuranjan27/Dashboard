from fastapi import APIRouter
from dotenv import load_dotenv
from jira_connection import check_jira_connection

router=APIRouter()
jira=check_jira_connection()  #contains jira acess...
load_dotenv()

@router.get("/testing")
def testing():
    return {
        "message" :" this is testing inside backend/routers/testing.py"
    }
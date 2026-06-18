from fastapi import APIRouter
from dotenv import load_dotenv
import os
from jira_connection import check_jira_connection
import requests

router=APIRouter()
jira=check_jira_connection()  #contains jira acess...
load_dotenv()


@router.get("/testing")
def testing():
    return {
        "message" :" this is testing inside backend/routers/testing.py"
    }

def get_issues_between_dates(jira, project_key,start_date,end_date):
    project_key=os.getenv('PROJECT_KEY')


    jql_query=(
        f'project = "{project_key}" '
        f'AND created >= "{start_date}" '
        f'AND created <= "{end_date}"'
    )

    issues=jira.search_issues(
        jql_query,
        maxResult=False
    )




from jira import JIRA
from requests import Session
from dotenv import load_dotenv
import os

load_dotenv()

# def checking(jira):
#     for singleIssue in jira.search_issues(jql_str='project=EPICV2'):
#         print('{}: {}: {}'.format(singleIssue.key, singleIssue.fields.summary, singleIssue.fields.reporter.displayName))

def check_jira_connection():
    try:
        server = os.getenv('SERVER')
        pat = os.getenv('PAT')

        session = Session()
        session.headers.update({"Authorization": f"Bearer {pat}"})

        jira = JIRA(
            server=server,
            options={"server": server, "verify": True},
            get_server_info=False
        )

        jira._session.headers.update({"Authorization": f"Bearer {pat}"})

        user = jira.myself()
        print("[OK] Successfully connected to Jira")
        print(f"Logged in as: {user.get('displayName')}")
        return jira  # return the jira object instead of True

    except Exception as e:
        print("[FAIL] Failed to connect to Jira")
        print("Reason:", str(e))
        return None


if __name__ == "__main__":
    jira = check_jira_connection()
    

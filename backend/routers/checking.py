from jira import JIRA
from dotenv import load_dotenv
from fastapi import APIRouter, HTTPException, Query
import os
import logging

try:
    from jira_connection import check_jira_connection
except ImportError:  # pragma: no cover - fallback for package-style execution
    from backend.jira_connection import check_jira_connection


logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)s | %(name)s | %(message)s",
    handlers=[
        logging.FileHandler("issues.log", encoding="utf-8"),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger("jira_issue_logger")

load_dotenv()

router = APIRouter(prefix="/jira", tags=["jira"])


def _safe_user(user_obj):
    if not user_obj:
        return None
    return {
        "accountId": getattr(user_obj, "accountId", "unknown"),
        "displayName": getattr(user_obj, "displayName", "Unknown"),
        "avatarUrl": getattr(getattr(user_obj, "avatarUrls", {}), "get", lambda *_: None)("48x48"),
    }


def _map_status(value):
    status = (value or "").strip().lower()
    mapping = {
        "to do": "To Do",
        "open": "To Do",
        "selected for development": "To Do",
        "in progress": "In Progress",
        "in review": "In Review",
        "review": "In Review",
        "blocked": "Blocked",
        "done": "Done",
        "closed": "Done",
        "cancelled": "Cancelled",
        "canceled": "Cancelled",
    }
    return mapping.get(status, "To Do")


def _map_priority(value):
    priority = (value or "").strip().lower()
    mapping = {
        "highest": "Critical",
        "critical": "Critical",
        "high": "High",
        "medium": "Medium",
        "low": "Low",
        "lowest": "Low",
    }
    return mapping.get(priority, "Medium")


def _map_type(value):
    issue_type = (value or "").strip().lower()
    mapping = {
        "story": "Story",
        "bug": "Bug",
        "task": "Task",
        "epic": "Epic",
        "sub-task": "Sub-task",
        "subtask": "Sub-task",
    }
    return mapping.get(issue_type, "Task")


def _extract_linked_issues(fields):
    linked = []
    issue_links = getattr(fields, "issuelinks", []) or []
    for link in issue_links:
        outward = getattr(link, "outwardIssue", None)
        inward = getattr(link, "inwardIssue", None)
        if outward and getattr(outward, "key", None):
            linked.append(outward.key)
        elif inward and getattr(inward, "key", None):
            linked.append(inward.key)
    return linked


def _issue_to_frontend_model(issue):
    fields = issue.fields
    parent = getattr(fields, "parent", None)
    created_at = getattr(fields, "created", None)
    updated_at = getattr(fields, "updated", None)
    resolved_at = getattr(fields, "resolutiondate", None)
    due_at = getattr(fields, "duedate", None)

    issue_payload = {
        "id": str(getattr(issue, "id", issue.key)),
        "key": issue.key,
        "summary": getattr(fields, "summary", ""),
        "status": _map_status(getattr(getattr(fields, "status", None), "name", None)),
        "type": _map_type(getattr(getattr(fields, "issuetype", None), "name", None)),
        "priority": _map_priority(getattr(getattr(fields, "priority", None), "name", None)),
        "assignee": _safe_user(getattr(fields, "assignee", None)),
        "reporter": _safe_user(getattr(fields, "reporter", None))
        or {"accountId": "unknown", "displayName": "Unknown", "avatarUrl": None},
        "creator": _safe_user(getattr(fields, "creator", None))
        or {"accountId": "unknown", "displayName": "Unknown", "avatarUrl": None},
        "labels": getattr(fields, "labels", []) or [],
        "components": [comp.name for comp in (getattr(fields, "components", []) or []) if getattr(comp, "name", None)],
        "created": created_at,
        "updated": updated_at,
        "resolved": resolved_at,
        "due": due_at,
        "storyPoints": getattr(fields, "customfield_10016", None),
        "parentKey": getattr(parent, "key", None),
        "linkedIssues": _extract_linked_issues(fields),
        "customFields": {},
    }

    logger.info(
        "Mapped issue=%s | summary=%s | type=%s | priority=%s | status=%s | created=%s | updated=%s | resolved=%s",
        issue_payload["key"],
        issue_payload["summary"],
        issue_payload["type"],
        issue_payload["priority"],
        issue_payload["status"],
        issue_payload["created"],
        issue_payload["updated"],
        issue_payload["resolved"],
    )
    return issue_payload


def get_project_issues(jira, project_key):
    issues_data = []

    try:
        issues = jira.search_issues(
            f'project = "{project_key}"',
            maxResults=False
        )
        logger.info("Fetched %s issues for project %s", len(issues), project_key)
    except Exception as exc:
        logger.exception("Failed to fetch issues for project %s: %s", project_key, exc)
        return issues_data

    for issue in issues:
        try:
            fields = issue.fields
            created_at = getattr(fields, "created", None)
            resolved_at = getattr(fields, "resolutiondate", None)

            logger.info(
                "Processing issue=%s |Summary=%s |Issue Type=%s  |Priority=%s|Status=%s |Assignee =%s  |Reporter =%s  | created_at=%s |updated_at=%s |resolved_at=%s ",
                issue.key,
                fields.summary,
                fields.issuetype.name,
                getattr(fields.priority, "name", None),
                fields.status.name,
                getattr(fields.assignee, "displayName", None),
                getattr(fields.reporter, "displayName", None),
                created_at,
                getattr(fields, "updated", None),
                resolved_at,
                
            )

            issues_data.append({
                "key": issue.key,
                "summary": fields.summary,
                "issue_type": fields.issuetype.name,
                "priority": getattr(fields.priority, "name", None),
                "status": fields.status.name,
                "assignee": getattr(fields.assignee, "displayName", None),
                "reporter": getattr(fields.reporter, "displayName", None),
                "created": created_at,
                "updated": getattr(fields, "updated", None),
                "resolution_date": resolved_at
            })
        except Exception as exc:
            logger.exception(
                "Failed while processing issue %s: %s",
                getattr(issue, "key", "unknown"),
                exc
            )
            continue

    return issues_data


def get_project_details(jira, project_key):
    try:
        project = jira.project(project_key)
        lead = getattr(project, "lead", None)
        payload = {
            "key": getattr(project, "key", project_key),
            "name": getattr(project, "name", project_key),
            "description": getattr(project, "description", "") or "",
            "lead": _safe_user(lead) or {"accountId": "unknown", "displayName": "Unknown", "avatarUrl": None},
            "components": [comp.name for comp in (getattr(project, "components", []) or []) if getattr(comp, "name", None)],
        }
        logger.info("Fetched project details for %s", payload["key"])
        return payload
    except Exception as exc:
        logger.exception("Failed to fetch project details for %s: %s", project_key, exc)
        raise


@router.get("/health")
def jira_health_check():
    try:
        jira = check_jira_connection()
        if not jira:
            raise ValueError("JIRA connection returned None")
        me = jira.myself()
        return {
            "status": "ok",
            "user": me.get("displayName", "unknown"),
        }
    except Exception as exc:
        logger.exception("JIRA health check failed: %s", exc)
        raise HTTPException(status_code=500, detail="JIRA connection failed") from exc


@router.get("/project")
def api_get_project(project_key: str | None = Query(default=None)):
    key = project_key or os.getenv("PROJECT_KEY")
    if not key:
        raise HTTPException(status_code=400, detail="PROJECT_KEY is missing")

    try:
        jira = check_jira_connection()
        if not jira:
            raise ValueError("Unable to connect to JIRA")
        return get_project_details(jira, key)
    except HTTPException:
        raise
    except Exception as exc:
        logger.exception("API project endpoint failed for %s: %s", key, exc)
        raise HTTPException(status_code=500, detail="Failed to fetch project details") from exc


@router.get("/issues")
def api_get_project_issues(
    project_key: str | None = Query(default=None),
    start_at: int = Query(default=0, ge=0),
    max_results: int = Query(default=100, ge=1, le=500),
):
    key = project_key or os.getenv("PROJECT_KEY")
    if not key:
        raise HTTPException(status_code=400, detail="PROJECT_KEY is missing")

    try:
        jira = check_jira_connection()
        if not jira:
            raise ValueError("Unable to connect to JIRA")

        # Fetch only fields used by the frontend to reduce payload size.
        fields = [
            "summary",
            "status",
            "issuetype",
            "priority",
            "assignee",
            "reporter",
            "creator",
            "labels",
            "components",
            "created",
            "updated",
            "resolutiondate",
            "duedate",
            "parent",
            "issuelinks",
            "customfield_10016",
        ]
        issues = jira.search_issues(
            f'project = "{key}" ORDER BY created DESC',
            startAt=start_at,
            maxResults=max_results,
            fields=fields,
        )

        data = []
        for issue in issues:
            try:
                data.append(_issue_to_frontend_model(issue))
            except Exception as issue_exc:
                logger.exception("Failed to map issue %s: %s", getattr(issue, "key", "unknown"), issue_exc)
                continue

        return {
            "issues": data,
            "count": len(data),
            "startAt": start_at,
            "maxResults": max_results,
        }
    except HTTPException:
        raise
    except Exception as exc:
        logger.exception("API issues endpoint failed for %s: %s", key, exc)
        raise HTTPException(status_code=500, detail="Failed to fetch issues") from exc


if __name__ == "__main__":
    try:
        #.........checking jira connection only............
        try:
            jira = check_jira_connection()
            logger.info("JIRA connection established successfully")
        except Exception as exc:
            logger.exception("Failed to establish JIRA connection: %s", exc)

        #.........checking jira connection only................

        project_key = os.getenv("PROJECT_KEY")

        issues = get_project_issues(
                jira=jira,
                project_key=project_key
            )
        logger.info("Total processed issues: %s", len(issues))
        
    except Exception as exc:
        logger.exception("Unhandled error while running issue fetch script: %s", exc)




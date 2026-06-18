import { jiraConfig } from "./config";
import { jiraFetch } from "./jiraClient";
import { MOCK_ISSUES, MOCK_PROJECT } from "./mockData";
import type { JiraIssue, JiraProject } from "./types";

export async function fetchProject(): Promise<JiraProject> {
  // if (jiraConfig.useMock) return MOCK_PROJECT;
  const suffix = jiraConfig.projectKey
    ? `?project_key=${encodeURIComponent(jiraConfig.projectKey)}`
    : "";
  return jiraFetch<JiraProject>(`/jira/project${suffix}`);
}

export async function fetchAllIssues(): Promise<JiraIssue[]> {
  // if (jiraConfig.useMock) return MOCK_ISSUES;

  const all: JiraIssue[] = [];
  let startAt = 0;
  const maxResults = 100;

  while (true) {
    const query = new URLSearchParams({
      start_at: String(startAt),
      max_results: String(maxResults),
    });
    if (jiraConfig.projectKey) query.set("project_key", jiraConfig.projectKey);

    const data = await jiraFetch<{ issues: JiraIssue[]; count: number }>(
      `/jira/issues?${query.toString()}`,
    );

    if (!data.issues.length) break;
    all.push(...data.issues);
    startAt += data.issues.length;
    if (data.issues.length < maxResults) break;
  }

  return all;
}
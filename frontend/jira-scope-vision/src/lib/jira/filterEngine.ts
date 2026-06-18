import type { IssueFilters, JiraIssue } from "./types";

export function applyFilters(issues: JiraIssue[], f: IssueFilters): JiraIssue[] {
  const fromTs = f.dateFrom ? new Date(f.dateFrom).getTime() : null;
  const toTs = f.dateTo ? new Date(f.dateTo).getTime() : null;
  return issues.filter((i) => {
    const created = new Date(i.created).getTime();
    if (fromTs !== null && created < fromTs) return false;
    if (toTs !== null && created > toTs) return false;
    if (f.statuses.length && !f.statuses.includes(i.status)) return false;
    if (f.priorities.length && !f.priorities.includes(i.priority)) return false;
    if (f.types.length && !f.types.includes(i.type)) return false;
    if (f.assignees.length) {
      const id = i.assignee?.accountId ?? "unassigned";
      if (!f.assignees.includes(id)) return false;
    }
    if (f.reporters.length && !f.reporters.includes(i.reporter.accountId)) return false;
    if (f.labels.length && !i.labels.some((l) => f.labels.includes(l))) return false;
    if (f.components.length && !i.components.some((c) => f.components.includes(c))) return false;
    return true;
  });
}

export function uniqueValues(issues: JiraIssue[]) {
  const labels = new Set<string>();
  const components = new Set<string>();
  const assignees = new Map<string, string>();
  const reporters = new Map<string, string>();
  for (const i of issues) {
    i.labels.forEach((l) => labels.add(l));
    i.components.forEach((c) => components.add(c));
    if (i.assignee) assignees.set(i.assignee.accountId, i.assignee.displayName);
    reporters.set(i.reporter.accountId, i.reporter.displayName);
  }
  return {
    labels: [...labels].sort(),
    components: [...components].sort(),
    assignees: [...assignees.entries()].sort((a, b) => a[1].localeCompare(b[1])),
    reporters: [...reporters.entries()].sort((a, b) => a[1].localeCompare(b[1])),
  };
}
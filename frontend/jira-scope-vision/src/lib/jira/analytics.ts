import type { JiraIssue } from "./types";

const DAY = 86400000;

export function daysBetween(a: string | Date, b: string | Date) {
  const t1 = typeof a === "string" ? new Date(a).getTime() : a.getTime();
  const t2 = typeof b === "string" ? new Date(b).getTime() : b.getTime();
  return Math.max(0, Math.round((t2 - t1) / DAY));
}

export function ageDays(issue: JiraIssue, now = new Date()) {
  return daysBetween(issue.created, issue.resolved ?? now.toISOString());
}

export const isClosed = (i: JiraIssue) =>
  i.status === "Done" || i.status === "Cancelled";
export const isOpen = (i: JiraIssue) => !isClosed(i);

export function kpiSummary(issues: JiraIssue[]) {
  const now = new Date();
  const total = issues.length;
  const open = issues.filter(isOpen).length;
  const closed = issues.filter(isClosed).length;
  const inProgress = issues.filter((i) => i.status === "In Progress").length;
  const blocked = issues.filter((i) => i.status === "Blocked").length;
  const critical = issues.filter((i) => i.priority === "Critical" && isOpen(i)).length;
  const overdue = issues.filter(
    (i) => i.due && new Date(i.due) < now && isOpen(i),
  ).length;
  const avgAge =
    issues.length === 0
      ? 0
      : Math.round(issues.reduce((s, i) => s + ageDays(i, now), 0) / issues.length);
  const resolved = issues.filter((i) => i.resolved);
  const avgResolution =
    resolved.length === 0
      ? 0
      : Math.round(
          resolved.reduce((s, i) => s + daysBetween(i.created, i.resolved!), 0) /
            resolved.length,
        );
  return { total, open, closed, inProgress, blocked, critical, overdue, avgAge, avgResolution };
}

export function groupCount<T extends string>(issues: JiraIssue[], key: (i: JiraIssue) => T) {
  const map = new Map<T, number>();
  for (const i of issues) {
    const k = key(i);
    map.set(k, (map.get(k) ?? 0) + 1);
  }
  return [...map.entries()].map(([name, value]) => ({ name, value }));
}

export function trendByDay(issues: JiraIssue[], days = 60) {
  const now = new Date();
  const buckets: { date: string; created: number; resolved: number; open: number; closed: number }[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    d.setHours(0, 0, 0, 0);
    buckets.push({
      date: d.toISOString().slice(5, 10),
      created: 0,
      resolved: 0,
      open: 0,
      closed: 0,
    });
  }
  const start = new Date(now);
  start.setDate(start.getDate() - (days - 1));
  start.setHours(0, 0, 0, 0);
  for (const issue of issues) {
    const cd = new Date(issue.created);
    cd.setHours(0, 0, 0, 0);
    const ci = Math.floor((cd.getTime() - start.getTime()) / DAY);
    if (ci >= 0 && ci < days) buckets[ci].created++;
    if (issue.resolved) {
      const rd = new Date(issue.resolved);
      rd.setHours(0, 0, 0, 0);
      const ri = Math.floor((rd.getTime() - start.getTime()) / DAY);
      if (ri >= 0 && ri < days) buckets[ri].resolved++;
    }
  }
  // Cumulative open/closed
  let open = 0;
  let closed = 0;
  for (const b of buckets) {
    open += b.created - b.resolved;
    closed += b.resolved;
    b.open = Math.max(0, open);
    b.closed = closed;
  }
  return buckets;
}

export function agingBuckets(issues: JiraIssue[]) {
  const buckets = [
    { name: "0-7d", min: 0, max: 7, value: 0 },
    { name: "8-14d", min: 8, max: 14, value: 0 },
    { name: "15-30d", min: 15, max: 30, value: 0 },
    { name: "31-60d", min: 31, max: 60, value: 0 },
    { name: "60+d", min: 61, max: Infinity, value: 0 },
  ];
  for (const i of issues.filter(isOpen)) {
    const age = ageDays(i);
    const b = buckets.find((x) => age >= x.min && age <= x.max);
    if (b) b.value++;
  }
  return buckets;
}

export function agingByStatus(issues: JiraIssue[]) {
  const names = ["0-7d", "8-14d", "15-30d", "31-60d", "60+d"] as const;
  const rows = names.map((n) => ({
    name: n,
    "To Do": 0,
    "In Progress": 0,
    "In Review": 0,
    Blocked: 0,
  })) as Array<Record<string, string | number>>;
  function bucketIdx(age: number) {
    if (age <= 7) return 0;
    if (age <= 14) return 1;
    if (age <= 30) return 2;
    if (age <= 60) return 3;
    return 4;
  }
  for (const i of issues.filter(isOpen)) {
    const idx = bucketIdx(ageDays(i));
    const row = rows[idx];
    if (i.status in row) row[i.status] = (row[i.status] as number) + 1;
  }
  return rows;
}

export function workloadByAssignee(issues: JiraIssue[]) {
  const map = new Map<string, { name: string; open: number; closed: number; total: number }>();
  for (const i of issues) {
    const name = i.assignee?.displayName ?? "Unassigned";
    const cur = map.get(name) ?? { name, open: 0, closed: 0, total: 0 };
    cur.total++;
    if (isOpen(i)) cur.open++;
    else cur.closed++;
    map.set(name, cur);
  }
  return [...map.values()].sort((a, b) => b.total - a.total);
}

export function resolutionByAssignee(issues: JiraIssue[]) {
  const map = new Map<string, number[]>();
  for (const i of issues) {
    if (!i.resolved || !i.assignee) continue;
    const arr = map.get(i.assignee.displayName) ?? [];
    arr.push(daysBetween(i.created, i.resolved));
    map.set(i.assignee.displayName, arr);
  }
  return [...map.entries()]
    .map(([name, arr]) => ({
      name,
      value: Math.round(arr.reduce((s, n) => s + n, 0) / arr.length),
      count: arr.length,
    }))
    .sort((a, b) => a.value - b.value);
}

export function topContributors(issues: JiraIssue[]) {
  const w = workloadByAssignee(issues);
  const res = new Map(resolutionByAssignee(issues).map((r) => [r.name, r.value]));
  return w
    .filter((r) => r.name !== "Unassigned")
    .map((r) => ({ ...r, avgResolution: res.get(r.name) ?? null }));
}

export function resolutionStats(issues: JiraIssue[]) {
  const buckets = [
    { name: "0-3d", min: 0, max: 3, value: 0 },
    { name: "4-7d", min: 4, max: 7, value: 0 },
    { name: "8-14d", min: 8, max: 14, value: 0 },
    { name: "15-30d", min: 15, max: 30, value: 0 },
    { name: "30+d", min: 31, max: Infinity, value: 0 },
  ];
  for (const i of issues) {
    if (!i.resolved) continue;
    const d = daysBetween(i.created, i.resolved);
    const b = buckets.find((x) => d >= x.min && d <= x.max);
    if (b) b.value++;
  }
  return buckets;
}

export function lifecycleFunnel(issues: JiraIssue[]) {
  const created = issues.length;
  const assigned = issues.filter((i) => i.assignee).length;
  const inProgress = issues.filter((i) =>
    ["In Progress", "In Review", "Blocked", "Done"].includes(i.status),
  ).length;
  const review = issues.filter((i) => ["In Review", "Done"].includes(i.status)).length;
  const done = issues.filter((i) => i.status === "Done").length;
  return [
    { name: "Created", value: created },
    { name: "Assigned", value: assigned },
    { name: "In Progress", value: inProgress },
    { name: "Review", value: review },
    { name: "Done", value: done },
  ];
}

export function workloadHeatmap(issues: JiraIssue[]) {
  const statuses = ["To Do", "In Progress", "In Review", "Blocked", "Done"];
  const names = [...new Set(issues.map((i) => i.assignee?.displayName ?? "Unassigned"))].slice(0, 12);
  const grid = names.map((name) => {
    const row: Record<string, number | string> = { name };
    for (const s of statuses) {
      row[s] = issues.filter(
        (i) => (i.assignee?.displayName ?? "Unassigned") === name && i.status === s,
      ).length;
    }
    return row;
  });
  return { statuses, names, grid };
}

export function staleIssues(issues: JiraIssue[]) {
  const now = Date.now();
  return issues
    .filter((i) => !i.resolved && now - new Date(i.updated).getTime() > 30 * DAY)
    .map((i) => ({
      key: i.key,
      summary: i.summary,
      assignee: i.assignee?.displayName ?? "Unassigned",
      status: i.status,
      daysSinceUpdate: Math.round((now - new Date(i.updated).getTime()) / DAY),
    }))
    .sort((a, b) => b.daysSinceUpdate - a.daysSinceUpdate);
}

export function recentActivity(issues: JiraIssue[], limit = 12) {
  const events: { kind: "created" | "updated" | "resolved"; issue: JiraIssue; at: string }[] = [];
  for (const i of issues) {
    events.push({ kind: "created", issue: i, at: i.created });
    events.push({ kind: "updated", issue: i, at: i.updated });
    if (i.resolved) events.push({ kind: "resolved", issue: i, at: i.resolved });
  }
  return events.sort((a, b) => +new Date(b.at) - +new Date(a.at)).slice(0, limit);
}

export function smartInsights(issues: JiraIssue[]): string[] {
  if (!issues.length) return ["No issues match the current filters."];
  const k = kpiSummary(issues);
  const insights: string[] = [];
  const inProgressPct = Math.round((k.inProgress / k.total) * 100);
  insights.push(`${inProgressPct}% of issues are currently in progress.`);
  if (k.critical > 0) insights.push(`${k.critical} critical issue${k.critical > 1 ? "s are" : " is"} still open.`);
  if (k.blocked > 0) insights.push(`${k.blocked} issue${k.blocked > 1 ? "s are" : " is"} blocked and need attention.`);
  const top = workloadByAssignee(issues).filter((w) => w.name !== "Unassigned")[0];
  if (top) insights.push(`Heaviest workload: ${top.name} with ${top.total} assigned issues.`);
  const fastest = resolutionByAssignee(issues)[0];
  if (fastest) insights.push(`Fastest resolver: ${fastest.name} (~${fastest.value}d avg).`);
  insights.push(`Average resolution time across the project is ${k.avgResolution} days.`);
  if (k.overdue > 0) insights.push(`${k.overdue} open issue${k.overdue > 1 ? "s are" : " is"} past their due date.`);
  return insights;
}

export function sparkline(issues: JiraIssue[], predicate: (i: JiraIssue) => boolean, days = 14) {
  const data = trendByDay(issues, days);
  return data.map((d, idx) => ({ idx, value: d.created /* placeholder */ }));
  // Kept simple: we use the created-trend for visual sparkline; predicate available for future.
  void predicate;
}
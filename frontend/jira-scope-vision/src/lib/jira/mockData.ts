import type {
  IssuePriority,
  IssueStatus,
  IssueType,
  JiraIssue,
  JiraProject,
  JiraUser,
} from "./types";

// Deterministic PRNG so re-renders show the same data.
function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const rand = mulberry32(42);
const pick = <T,>(arr: readonly T[]) => arr[Math.floor(rand() * arr.length)];

const USERS: JiraUser[] = [
  { accountId: "u1", displayName: "John Carter" },
  { accountId: "u2", displayName: "Maya Patel" },
  { accountId: "u3", displayName: "Diego Alvarez" },
  { accountId: "u4", displayName: "Sofia Müller" },
  { accountId: "u5", displayName: "Aiko Tanaka" },
  { accountId: "u6", displayName: "Liam O'Brien" },
  { accountId: "u7", displayName: "Priya Shah" },
  { accountId: "u8", displayName: "Noah Williams" },
];

const STATUSES: IssueStatus[] = [
  "To Do",
  "In Progress",
  "In Review",
  "Blocked",
  "Done",
  "Cancelled",
];
const PRIORITIES: IssuePriority[] = ["Critical", "High", "Medium", "Low"];
const TYPES: IssueType[] = ["Story", "Bug", "Task", "Epic", "Sub-task"];
const LABELS = [
  "frontend",
  "backend",
  "infra",
  "design",
  "performance",
  "security",
  "tech-debt",
  "customer",
  "regression",
  "research",
];
const COMPONENTS = [
  "Web App",
  "API",
  "Auth",
  "Billing",
  "Notifications",
  "Analytics",
  "Mobile",
  "Platform",
];

const SUMMARIES = [
  "Fix login redirect on Safari",
  "Optimize dashboard query latency",
  "Add multi-tenant support to billing",
  "Investigate flaky CI test",
  "Refactor notification service",
  "Improve onboarding empty state",
  "Audit auth token rotation",
  "Migrate legacy webhook handlers",
  "Reduce bundle size on landing",
  "Add export-to-CSV in reports",
  "Fix race condition in worker pool",
  "Update Stripe webhook signing",
  "Implement dark mode polish",
  "Add audit log retention policy",
  "Investigate elevated 5xx rate",
  "Backfill missing analytics events",
  "Add rate limiting to public API",
  "Refresh design tokens",
];

function daysAgo(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString();
}

function makeIssue(i: number): JiraIssue {
  const createdDaysAgo = Math.floor(rand() * 180);
  const status = pick(STATUSES);
  const type = pick(TYPES);
  const priority =
    rand() < 0.1
      ? "Critical"
      : rand() < 0.35
        ? "High"
        : rand() < 0.8
          ? "Medium"
          : "Low";
  const resolvedOffset =
    status === "Done" || status === "Cancelled"
      ? Math.max(1, Math.floor(rand() * createdDaysAgo))
      : null;
  const updatedDaysAgo =
    resolvedOffset !== null
      ? resolvedOffset
      : Math.floor(rand() * Math.max(1, createdDaysAgo));
  const isUnassigned = rand() < 0.08;
  const numLabels = Math.floor(rand() * 3);
  const labels = Array.from(
    new Set(Array.from({ length: numLabels }, () => pick(LABELS))),
  );
  const numComponents = 1 + Math.floor(rand() * 2);
  const components = Array.from(
    new Set(Array.from({ length: numComponents }, () => pick(COMPONENTS))),
  );
  const hasParent = type === "Sub-task" || rand() < 0.2;
  const linkedCount = Math.floor(rand() * 3);
  return {
    id: String(1000 + i),
    key: `PROJ-${100 + i}`,
    summary: pick(SUMMARIES) + (rand() < 0.4 ? " (phase " + (1 + Math.floor(rand() * 3)) + ")" : ""),
    status,
    type,
    priority,
    assignee: isUnassigned ? null : pick(USERS),
    reporter: pick(USERS),
    creator: pick(USERS),
    labels,
    components,
    created: daysAgo(createdDaysAgo),
    updated: daysAgo(updatedDaysAgo),
    resolved: resolvedOffset !== null ? daysAgo(resolvedOffset) : null,
    due:
      rand() < 0.4
        ? daysAgo(Math.floor(rand() * 60) - 30)
        : null,
    storyPoints: rand() < 0.7 ? pick([1, 2, 3, 5, 8, 13]) : null,
    parentKey: hasParent ? `PROJ-${100 + Math.floor(rand() * 30)}` : null,
    linkedIssues: Array.from(
      new Set(
        Array.from({ length: linkedCount }, () => `PROJ-${100 + Math.floor(rand() * 220)}`),
      ),
    ),
  };
}

export const MOCK_ISSUES: JiraIssue[] = Array.from({ length: 220 }, (_, i) => makeIssue(i));

export const MOCK_PROJECT: JiraProject = {
  key: "PROJ",
  name: "Apollo Platform",
  description: "Core platform engineering and product analytics workstreams.",
  lead: USERS[0],
  components: COMPONENTS,
};

export const MOCK_USERS = USERS;
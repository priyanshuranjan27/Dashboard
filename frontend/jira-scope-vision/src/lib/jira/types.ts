export type IssueStatus =
  | "To Do"
  | "In Progress"
  | "In Review"
  | "Blocked"
  | "Done"
  | "Cancelled";

export type IssuePriority = "Critical" | "High" | "Medium" | "Low";
export type IssueType = "Story" | "Bug" | "Task" | "Epic" | "Sub-task";

export interface JiraUser {
  accountId: string;
  displayName: string;
  avatarUrl?: string;
}

export interface JiraIssue {
  id: string;
  key: string;
  summary: string;
  status: IssueStatus;
  type: IssueType;
  priority: IssuePriority;
  assignee: JiraUser | null;
  reporter: JiraUser;
  creator: JiraUser;
  labels: string[];
  components: string[];
  created: string; // ISO
  updated: string; // ISO
  resolved: string | null; // ISO
  due: string | null; // ISO
  storyPoints: number | null;
  parentKey: string | null;
  linkedIssues: string[];
  customFields?: Record<string, unknown>;
}

export interface JiraProject {
  key: string;
  name: string;
  description: string;
  lead: JiraUser;
  components: string[];
}

export interface IssueFilters {
  dateFrom?: string;
  dateTo?: string;
  statuses: IssueStatus[];
  priorities: IssuePriority[];
  types: IssueType[];
  assignees: string[]; // accountIds, "unassigned" for null
  reporters: string[];
  labels: string[];
  components: string[];
}

export const emptyFilters: IssueFilters = {
  statuses: [],
  priorities: [],
  types: [],
  assignees: [],
  reporters: [],
  labels: [],
  components: [],
};
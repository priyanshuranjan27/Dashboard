// Replace these dummy values with real Jira credentials.
// Note: Atlassian Cloud APIs are not browser-callable due to CORS.
// For real data, proxy these calls through a server function/edge route.
export const jiraConfig = {
  backendBase:
    (import.meta.env.VITE_BACKEND_URL as string | undefined)?.replace(/\/$/, "") ??
    "http://127.0.0.1:8000/api",
  projectKey: (import.meta.env.VITE_PROJECT_KEY as string | undefined) ?? "",
  // Set VITE_USE_MOCK=true to force mock data.
  // useMock: String(import.meta.env.VITE_USE_MOCK ?? "false").toLowerCase() === "true",
};
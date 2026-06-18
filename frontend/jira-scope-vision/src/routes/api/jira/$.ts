import { createFileRoute } from "@tanstack/react-router";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

async function proxy(request: Request, splat: string) {
  const baseUrl = process.env.JIRA_BASE_URL;
  const email = process.env.JIRA_EMAIL;
  const token = process.env.JIRA_API_TOKEN;

  if (!baseUrl || !email || !token) {
    return new Response(
      JSON.stringify({
        error: "Jira proxy not configured",
        missing: {
          JIRA_BASE_URL: !baseUrl,
          JIRA_EMAIL: !email,
          JIRA_API_TOKEN: !token,
        },
      }),
      { status: 500, headers: { "Content-Type": "application/json", ...CORS } },
    );
  }

  const incoming = new URL(request.url);
  const target = new URL(
    `${baseUrl.replace(/\/$/, "")}/${splat}${incoming.search}`,
  );

  const auth = Buffer.from(`${email}:${token}`).toString("base64");

  const init: RequestInit = {
    method: request.method,
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Basic ${auth}`,
    },
  };
  if (!["GET", "HEAD"].includes(request.method)) {
    init.body = await request.text();
  }

  const res = await fetch(target.toString(), init);
  const body = await res.text();
  return new Response(body, {
    status: res.status,
    headers: {
      "Content-Type": res.headers.get("content-type") ?? "application/json",
      ...CORS,
    },
  });
}

export const Route = createFileRoute("/api/jira/$")({
  server: {
    handlers: {
      OPTIONS: async () => new Response(null, { status: 204, headers: CORS }),
      GET: async ({ request, params }) => proxy(request, params._splat ?? ""),
      POST: async ({ request, params }) => proxy(request, params._splat ?? ""),
      PUT: async ({ request, params }) => proxy(request, params._splat ?? ""),
      DELETE: async ({ request, params }) => proxy(request, params._splat ?? ""),
    },
  },
});